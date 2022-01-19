//dc.config.defaultColors(d3.schemeCategory10);
//let AdmissionChart = new dc.BarChart('#yearly-volume-chart');
let file_path ="./data/";
let mycrossfilters = Array(193);// 最好每个文件更新一次

function timer_scaler(start, end){
    start_t = start ;
    end_t = end;
}
function time_test(p){
    let s=new Date().getTime();
    p;
    console.log("Time costs : "+ (new Date().getTime() - s));
    return;
}
//计算严重程度
function critic(policy, active, num_con, times) {
    var l = [[],[],[],[],[]];
    if(!policy){
        //这台机子在这个时间段没有启动，也许要增加奇怪的对应
        return 0;
    }
    var s = 0;
    for(let i=0; i<policy.length; ++i) {
        if(policy[i] == 1 && active[i]==1) {
            continue;
        }
        s += ((policy[i]-1)+(active[i]-1))*num_con[i];
    }
    return s;
}
function main(){
    let s=new Date().getTime();
    t =[d3.csv("./data/meta-3-7.csv")];
    for(let i=start_t;i<=end_t;++i){
        t[i+1]=d3.csv(file_path+"part"+i+".csv");
    }
    Promise.all(t)
    // d3.csv(file_path+"part1.csv")
    .then(data=>{
    
    let e=new Date().getTime();
    console.log("time cost: "+(e-s));
    time_test(console.log("Success"));
    // 处理元数据
    console.log(data);
    for(let i=0; i<data[0].length; ++i) {
        if(i==0) console.log(data[0][i]); //use for debug
        insert(tree_root, data[0][i].ipaddr.split('.'), data[0][i]);
    }
    console.log(tree_root);

    // 向ip_tree上增加记录状态的项
    // TODO
    let flag_update = true;
    function insert_status(cur, rest_ip, policy, active, num_connect, timestamp) {
        if(rest_ip.length == 0) {
            if(!flag_update && cur['policy']){
                cur['policy'].push(policy);
                cur['active'].push(active);
                cur['connections'].push(num_connect);
                cur['times'].push(timestamp);
            }
            else {
                flag_update = false;
                cur['policy'] = [policy];
                cur['active'] = [active];
                cur['connections'] = [num_connect];
                cur['times'] = [timestamp];
            }
            return;
        }
        var t = parseInt(rest_ip[0]);
        rest_ip.shift();
        // for(let i=0; i<cur['children'].length; ++i) {
        //     if(cur.children[i]['ip_index'] == t) {
        //         t = i;
        //         break;//这一行必须是必须运行的
        //     }
        // }
        insert_status(cur['children'][t], rest_ip, policy, active, num_connect, timestamp);
    }
    function cacl_critic(cur) {
        function  judgeNaN (value) {
            return (typeof value) === 'number' && window.isNaN(value);
        }
        
        if('value' in cur) {
            cur['color_value'] = critic(cur['policy'], cur['active'], cur['connections'], cur['times']);
            if(judgeNaN(cur['color_value'])) console.log(cur['name']);
            return;
        }
        var s = 0;
        if(cur['children'].length == 0) console.log(cur['name']);
        for(let i=0; i<cur['children'].length; ++i) {
            cacl_critic(cur['children'][i]);
            s += cur['children'][i]['color_value']/cur['children'].length;
        }
        cur['color_value'] = s;
        return;
    }
    mycrossfilters[0] = crossfilter(data[0]);

    // 处理时间段数据
    for(let i=start_t; i<=end_t; ++i) {
        if (!mycrossfilters[i+1])
            mycrossfilters[i+1] = crossfilter(data[i+1]);
        // console.log(data[i+1]);
        for(let j=0; j<data[i+1].length; ++j) {
            let ipaddr = data[i+1][j].ipaddr.split('.');
            insert_status(tree_root, ipaddr, 
                data[i+1][j].policystatus, data[i+1][j].activityflag,
                data[i+1][j].numconnections, i);
        }
    }
    console.log('test', tree_root);

    // //defination of usable variables
    let mydiv="#bar";
    let linediv='#line';
    let treediv='#tree';
    const barwidth=$(mydiv).width();
    const barheight=$(mydiv).height();
    const linewidth = $(linediv).width();
    const lineheight = $(linediv).height();
    const treewidth = $(treediv).width();
    const treeheight = $(treediv).height();

    function update(){
        let treemapdata=genTreeData_ip();
        cacl_critic(tree_root); //每次更新值
        console.log("tree",treemapdata);
        draw_treemap(treemapdata,{
            div:mydiv,
            width:barwidth,
            height:barheight
        });
    }
    update();
    
    function genTreeData(){
        let ret={};
        let ret_children=[];
        let layer0_index=[];
        ret['name']='Total';
        
        let layer0_crossfilter= mycrossfilters[0].dimension(d => d.businessunit);
        console.log('layer0:',layer0_crossfilter.group().top(10));
        // console.log(layer0_crossfilter);
        for(nam of layer0_crossfilter.group().top(Infinity)){
            layer0_index.push(nam.key);
        }
        console.log("layer0",layer0_index);
        for(layer0_obj of layer0_index){
            let ret_child={};
            let layer0_children=[];
            ret_child['name']=layer0_obj;
            let layer1_crossfilter = new crossfilter(layer0_crossfilter.filter(layer0_obj).top(Infinity)).dimension(d=>d.facility);
            // console.log(layer1_crossfilter.group().top(10));
            for(nam of layer1_crossfilter.group().top(Infinity)){
                let layer0_child={};
                layer0_child['name']=nam.key;
                layer0_child['value']=nam.value;
                layer0_children.push(layer0_child);
            }
            ret_child['children']=layer0_children;
            ret_children.push(ret_child);
        }

        // to decide color here

        ret['children']=ret_children;
        console.log(ret);
        return ret;
    }
    function genTreeData_ip(){
        let queue = [tree_root];
        while(queue.length>0) {
            let cur = queue[0];
            queue.shift();
            if(!cur['children'])
                break;
            cur['children'] = cur['children'].filter(function(item) {
                return item;
            });
            for(let i=0; i<cur['children'].length; ++i) {
                queue.push(cur['children'][i]);
            }
        }
        return tree_root;
    }
    });
}

function draw_treemap(data,{
    div=undefined,
    width=640,
    height= 500
    }={}){
    function guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }
    let format = d3.format(",d")
    let name = d=>d.ancestors().reverse().map(d=>d.data.name).join("/");
    let treemap = data => d3.treemap()
    .tile(tile)
    .padding(0.0001)
        (d3.hierarchy(data)
            .sum(d => d.value)
            .sort((a, b) => b.value - a.value));

    function tile(node,x0,y0,x1,y1){
        d3.treemapSquarify(node,0,0,width,height);
        for(let child of node.children){
            child.x0 = x0+child.x0/width*(x1-x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
        }
    }
    console.log(treemap(data));

    var a = d3.rgb(255,0,0);	//红色
    var b = d3.rgb(0,255,0);	//绿色
    
    var color = d3.interpolate(b,a);
    let x = d3.scaleLinear().rangeRound([0,width]);
    let y = d3.scaleLinear().rangeRound([0, height]);

    d3.select(div)
      .selectAll('*').remove();

    let svg =d3.select(div)
                .append('svg')
                .attr("viewBox", [0.5, -15.5, width, height+20 ])
                .style("font", "10px sans-serif");

    let group=svg.append("g")
        .call(render,treemap(data));

    function render(group,root){
        let node = group.selectAll('g')
                        .data(root.children.concat(root))
                        .join("g");
        
        node.filter(d=>d===root?d.parent:d.children)
            .attr("cursor","pointer")
            .on("click",(event, d) => d === root ? zoomout(root) : zoomin(d));
            node.append("title")
            .text(d => `${name(d)}\n${format(d.value)}`);
        
        node.append("rect")
            .attr("id", d => (d.leafUid = guid()).id)
            .attr("fill", d => {
                //TODO
                var linear1 = d3.scaleLinear()
                        .domain([0,20])
                        .range([0,1]);
                return color(linear1(d.data.color_value));
            })
            .attr("fill-opacity",0.7)
            .on("mouseover",function(d,i){
                d3.select(this)
                .transition()
                .delay(20)
                .attr('fill-opacity',0.2);
            })
            .on("mouseout",function(d,i){
                d3.select(this)
                .transition()
                .delay(20)
                .attr("fill-opacity",0.7);
            });
        node.append("clipPath")
            .attr("id", d => (d.clipUid = guid()).id)
            .append("use")
            .attr("xlink:href", d => d.leafUid.href);
    
        node.append("text")
            .attr("clip-path", d => d.clipUid)
             .attr("font-weight", d => d === root ? "bold" : null)
            .selectAll("tspan")
           .data(d => (d === root ? name(d) : d.data.name).split(/(?=[A-Z][^A-Z])/g).concat(format(d.value)))
            .join("tspan")
            .attr("x", 3)
            .attr("y", (d, i, nodes) => `${(i === nodes.length - 1) * 0.3 + 1.1 + i * 0.9}em`)
            .attr("fill-opacity", (d, i, nodes) => i === nodes.length - 1 ? 0.7 : null)
            .attr("font-weight", (d, i, nodes) => i === nodes.length - 1 ? "normal" : null)
            .text(d => d);
        group.call(position,root);
    }

    function position(group,root){
        group.selectAll("g")
        .attr("transform", d => d === root ? `translate(0,-30)` : `translate(${x(d.x0)},${y(d.y0)})`)
        .select("rect")
        .attr("width", d => d === root ? width : x(d.x1) - x(d.x0))
        .attr("height", d => d === root ? 30 : y(d.y1) - y(d.y0));
    }

    function zoomin(d){
        let group0=group.attr("pointer-events","none");
        let group1=group=svg.append("g").call(render,d);
        x.domain([d.x0, d.x1]);
        y.domain([d.y0, d.y1]);

        svg.transition()
        .duration(750)
        .call(t => group0.transition(t).remove()
          .call(position, d.parent))
        .call(t => group1.transition(t)
          .attrTween("opacity", () => d3.interpolate(0, 1))
          .call(position, d));
    }

    function zoomout(d){
        let group0 = group.attr("pointer-events","none");
        let group1 = group=svg.insert("g","*").call(render,d.parent);

        x.domain([d.parent.x0, d.parent.x1]);
        y.domain([d.parent.y0, d.parent.y1]);

        svg.transition()
        .duration(750)
        .call(t => group0.transition(t).remove()
          .attrTween("opacity", () => d3.interpolate(1, 0))
          .call(position, d))
        .call(t => group1.transition(t)
          .call(position, d.parent));
    }
}



main();