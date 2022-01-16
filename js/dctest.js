//dc.config.defaultColors(d3.schemeCategory10);
//let AdmissionChart = new dc.BarChart('#yearly-volume-chart');
let file_path ="./data/";
let csv_files = ['part0.csv','part1.csv','part2.csv','part3.csv','part4.csv','part5.csv','part6.csv','part7.csv'];
let start_t=0,end_t=1; //TODO:  bind with the function to  
function timer_scaler(start, end){
  start_t = start ;
  end_t = end;
}
function time_test(p){
  let s=new Date.getTime();
  p;
  console.log("Time costs : "+ (new Date.getTime() - s));
  return;
}
function main(){
    let s=new Date().getTime();
    t =[];
    for(let i=start_t;i<=end_t;++i){
      t[i]=d3.csv(file_path+"part"+i+".csv");
    }
    Promise.all(t)
    // d3.csv(file_path+"part1.csv")
    .then(data=>{
    
    let e=new Date().getTime();
    console.log("time cost: "+(e-s));
    time_test(console.log("Success"));
    
    console.log(data);
    // let totAttib=['year','ssvbject','hometown','Fname','site','class','rank'];
    // let barAttib = ['year','subject','Fname','site','class','rank'];
    // let lineAttib=['hometown'];
    // let treeAttib=['site','Fname'];
    // //for( key in data[0])barAttib.push(key);
    // console.log(barAttib);
    // let mycrossfilter = crossfilter(data);
    // /** the year data **/
    // let year =mycrossfilter.dimension(d=>d.year);
    // let years = year.group();
    // console.log(years.top(5));

    // /** the site data **/
    // let site = mycrossfilter.dimension(d=>d.site);
    // let sites = site.group();
    // console.log(sites.top(5));

    // /* the subject data */
    // let subject = mycrossfilter.dimension(d=>d.subject);
    // let subjects = subject.group();
    // console.log(subjects.top(5));
    // let subjectSort=[];
    // subjects.all().forEach(d=>{subjectSort.push(d.key)});
    // console.log(subjectSort);

    // /* the rank data */
    // let rank = mycrossfilter.dimension(d=>d.rank);
    // let ranks= rank.group();
    // console.log('rank',rank.top(20));
    
    // mycroslogsfilter.dims=new Map();
    // mycrossfilter.groups=new Map();

    // for(let a of totAttib){
    //     let dim = mycrossfilter.dimension(a);
    //     mycrossfilter.dims.set(a,dim);
    //     mycrossfilter.groups.set(a,dim.group());
    // }
    // console.log(mycrossfilter.all());
    // //const div = html`<div style="display:flex"><div>`;

    // //defination of usable variables
    // let mydiv="#bar";
    // let linediv='#line';
    // let treediv='#tree';
    // const barwidth=$(mydiv).width();
    // const barheight=$(mydiv).height();
    // const linewidth = $(linediv).width();
    // const lineheight = $(linediv).height();
    // const treewidth = $(treediv).width();
    // const treeheight = $(treediv).height();
    // //
    // const charts = new Map();
    // for (let a of barAttib){
    //     let chart = BrushableBarChart()
    //                 .x("value")
    //                 .y("key")
    //                 .width(barwidth/barAttib.length)
    //                 .height(barheight)
    //                 .onBrush(selection=>{
    //                     const keys = selection.map(d=>d.key);
    //                     mycrossfilter.dims.get(a).filter(keys.length===0?null:d=>keys.includes(d));
    //                     update();
    //                 });
    //     charts.set(a,chart);
    // }

    // /*

    // */
   
  function update(){
      d3.select(mydiv)
          .selectAll('.charts')
          .data(barAttib)
          .join("div")
          .attr("class","charts")
          .style("width",barwidth/barAttib.length)
          .each(function(a){
              
                  if(a === "hometown"||a==="Fname"){
                    tdata=mycrossfilter.groups.get(a).top(10);
                  }
                  else if(a==="site"||a==="subject"){
                    tdata = mycrossfilter.groups.get(a).top(5);
                  }
                  else if(a==="rank"){
                    tdata= mycrossfilter.groups.get(a).top(50);
                  }
                  else tdata=mycrossfilter.groups.get(a).all();
                  
              d3.select(this)
                  .datum(tdata)
                  .text(a)
                  .call(charts.get(a));
          });
      let linedata=genTopNdata(lineAttib[0],5);
      LineChart(linedata,{
        x:d=>d.year,
        y:d=>d.amount,
        z:d=>d.sort,
        yLabel:"↑ Amount(Hometown Top 5 and Total)",
        width:linewidth,
        height:lineheight,
        color:d3.scaleOrdinal(d3.schemeCategory10),
        div:linediv
      });
      let treemapdata=genTreeData(treeAttib);
      console.log("tree",treemapdata);
      draw_treemap(treemapdata,{
        div:treediv,
        width:treewidth,
        height:treeheight
      });
  }
  // update();
    
  function genTreeData(selected){
    let ret={};
    let ret_children=[];
    let layer0_index=[];
    ret['name']='Total';
    
    let layer0_crossfilter=new crossfilter(mycrossfilter.dims.get(selected[0]).top(Infinity)).dimension(selected[0]);
    console.log(layer0_crossfilter.top(10));
    for(nam of layer0_crossfilter.group().top(10)){
      layer0_index.push(nam.key);
    }
    console.log("layer0",layer0_index);
    for(layer0_obj of layer0_index){
      let ret_child={};
      let layer0_children=[];
      ret_child['name']=layer0_obj;
      let layer1_crossfilter = new crossfilter(layer0_crossfilter.filter(layer0_obj).top(Infinity)).dimension(selected[1]);
      for(nam of layer1_crossfilter.group().top(10)){
        let layer0_child={};
        layer0_child['name']=nam.key;
        layer0_child['value']=nam.value;
        layer0_children.push(layer0_child);
      }
      ret_child['children']=layer0_children;
      ret_children.push(ret_child);
    }

    ret['children']=ret_children;
    return ret;
  }
     
  function genTopNdata(obj,N){
    let ret=[];
    let item = {};
    let obj_index=[];
    for(nam of mycrossfilter.groups.get(obj).top(N)){
      obj_index.push(nam.key);
    }

    let obj_crossfilter = new crossfilter(mycrossfilter.dims.get(obj).top(Infinity)).dimension(obj);

    let tot_crossfilter = new crossfilter(obj_crossfilter.top(Infinity)).dimension('year');

    let tot_group = tot_crossfilter.group();
    
    for(token of tot_group.all()){
      item['year']=parseInt(token.key);
      item['amount']=token.value;
      item['sort']='total';
      ret.push(item);
      item={};
    }
    
    for(ti of obj_index){
      let year_crossfilter = new crossfilter(obj_crossfilter.filter(ti).top(Infinity)).dimension('year');
      
      let year_group=year_crossfilter.group();
      
      for(token of year_group.all()){
        item['year']=parseInt(token.key);
        item['amount']=token.value;
        item['sort']=ti;
        ret.push(item);
        item={};
      }
    }
    return ret;
  }
});
 
}
function BrushableLineChart(){
  var margin = {left:120,top:20,right:20,bottom:20};
  function LinearChart(data,{
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    N = 20, // number of periods for rolling mean
    K = 2, // number of standard deviations to offset each band
    curve = d3.curveLinear, // method of interpolation between points
    marginTop = 20, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 30, // bottom margin, in pixels
    marginLeft = 40, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    xDomain=undefined, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    xAttr=undefined, // The attribute of selected axis x
    yDomain=undefined, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat=undefined, // The format format specifier string for the y-axis
    yAttr=undefined, // The attribute of selected axis ylabel for the y-axis
    colors = ["#aaa", "green", "blue", "red"], // color of the 4 lines
    strokeWidth = 1.5, // width of lines, in pixels
    strokeLinecap = "round", // stroke line cap of lines
    strokeLinejoin = "round" // stroke line join of lines
  }={}){
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const I = d3.range(X.length);

    // Compute default domains.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];

    // Construct scales and axes.
    const xScale = d3.scaleUtc(xDomain, xRange);
    const yScale = d3.scaleLinear(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(null, yFormat);

    // var brush = d3.brushX();
    
    // let updateBrush=(sel, data)=>{
    //   function brushed(event){
    //     let selection = event.selection;
    //     if(!event.sourceEvent)return;
    //     if(selection){
    //       let [x0,x1]=selection;

    //       let isSelected = d => 
    //         xScale(d[xAttr])+strokeWidth >= x0 && xScale(d[xAttr]) <=y1;

    //       let filteredData = sel
    //         .selectAll(".item")
    //         .style("fill","#ccc")
    //         .filter(isSelected)
    //         .style("fill","steelblue")
    //         .data();
    //       console.log("lineChart",x1,x0,filteredData);
          
    //       onBrush(filteredData);
    //     }else{
    //       sel.selectAll(".item").style("fill","steelblue");
    //       onBrush(null);
    //     }
    //   }
    //   brush
    //     .extent([
    //       [0,0], 
    //       [
    //         width -margin.left-margin.right, 
    //         height-margin.top-margin.bottom
    //       ]
    //     ])

    //     .on("start brush end",brushed);

    //   sel.select(".brush").call(brush);
    // };
    
    // let onEnter = enter => {
    //   let svgEnter = enter.append("svg");
      
    //   let g = svgEnter.append("g")
    //     .attr("class","gDrawing");
    //   g.append("g")
    //   .attr("class","x-axis")
    //   .append("text")
    //   .attr("class","axisLabel");
    //   g.append("g")
    //   .attr("class","y-axis")
    //   .append("text")
    //   .attr("class","axisLabel");
    //   g.append("g").attr("class","marks");
    //   g.append("g").attr("class","brush");
    //   return svgEnter;
    // }
    // let onUpdate = update=>update;
    // let onExit = exit=>exit.remove();

    // function chart(sel){
    //   sel.each(data=>{
    //     let iwidth = width - margin.left - margin.right,
    //       iheight = height - margin.top -margin.bottom;
    //     let svg = sel
    //       .selectAll("svg")
    //       .data([data])
    //       .join(onEnter,onUpdate,onExit)
    //       .attr("viewBox",[0,0,width,height])
    //       .attr("width",width)
    //       .attr("height",height);
    //     let g = svg 
    //         .select("g")
    //         .attr("transform",`translate(${margin.left},${margin.top})`);
    //     xDomain.range([0,iwidth]);
    //     yDomain.range([0,iheight]);
    //     updateBrush(sel,data);

    //     let t = g.transition.duration(250);

    //     g.select(".brush").call(brush);

    //     g.select(".y-axis")
    //       .attr("transform",`translate(0,${iwidth})`)
    //       .transition(t)
    //       .call(d3.axisLeft(yScale).ticks(3));
    //     g.select(".y-axis")
    //       .select(".axisLabel")
    //       .style("fill", "black")
    //       .attr("transform",`translate(${iheight},-10)`)
    //       .style("text-anchor","end")
    //       .text(yAttr);

    //     g.select(".x-axis")
    //       .transition(t)
    //       .call(d3.axisBottom(xScale).ticks(3));
    //     g.select(".x-axis")
    //       .select(".axisLabel")
    //       .style("fill", "black")
    //       .style("text-anchor","middle")
    //       .attr("transform",`translate(0,-10)`)
    //       .text(xAttr);

    //     let moveItems = item => 
    //       item
    //       .attr("x",0)
    //       .attr("width",d=>xScale(d[xAttr]))
    //       .attr("y",d=>yScale(d[yAttr]));
    //     g.select(".marks")
    //       .selectAll(".item")
    //       .data(data,(d,i) =>(id!=null?d[id]:i))
    //       .join(
    //         enter=>
    //           enter
    //             .append("rect")
    //             .attr("class","item")
    //             .call(moveItems),
    //         update => update.call(update=>update.trasition(t).call(moveItems))
    //       )
    //       .attr("width",strokeWidth)
    //       .style("fill","steelblue");

    //   });
    // }

    // chart.x = function(_){
    //   if(!argments.length)return xAttr;
    //   xAttr =_ ;
    //   return chart;
    // } 
    // chart.y = function(_) {
    //   if (!arguments.length) return yAttr;
    //   yAttr = _;
    //   return chart;
    // };
    // chart.width = function(_) {
    //   if (!arguments.length) return width;
    //   width = _;
    //   return chart;
    // };
    // chart.height = function(_) {
    //   if (!arguments.length) return height;
    //   height = _;
    //   return chart;
    // };
    // chart.onBrush = function(_) {
    //   if (!arguments.length) return onBrush;
    //   onBrush = _;
    //   return chart;
    // };
    // chart.id = function(_) {
    //   if (!arguments.length) return id;
    //   id = _;
    //   return chart;
    // };
  
    
    // Construct a line generator.
    const line = d3.line()
        .defined((y, i) => !isNaN(X[i]) && !isNaN(y))
        .curve(curve)
        .x((y, i) => xScale(X[i]))
        .y((y, i) => yScale(y));
    function linear(N,K){
      return values => {
      let i = 0;
      let sum = 0;
      let sum2 = 0;
      const Y = new Float64Array(values.length).fill(NaN);
      for (let n = Math.min(N - 1, values.length); i < n; ++i) {
        const value = values[i];
        sum += value, sum2 += value ** 2;
      }
      for (let n = values.length; i < n; ++i) {
        const value = values[i];
        sum += value, sum2 += value ** 2;
        const mean = sum / N;
        const deviation = Math.sqrt((sum2 - sum ** 2 / N) / (N - 1));
        Y[i] = mean + deviation * K;
        const value0 = values[i - N + 1];
        sum -= value0, sum2 -= value0 ** 2;
      }
      return Y;
    }
  }
    svg = d3.select("")// TODO: fill the layout element 
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic; overflow: visible;");
    svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(xAxis);

  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(yAxis)
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll(".tick line").clone()
          .attr("x2", width - marginLeft - marginRight)
          .attr("stroke-opacity", 0.1))
      .call(g => g.append("text")
          .attr("x", -marginLeft)
          .attr("y", 10)
          .attr("fill", "currentColor")
          .attr("text-anchor", "start")
          .text(yLabel));

  svg.append("g")
      .attr("fill", "none")
      .attr("stroke-width", strokeWidth)
      .attr("stroke-linejoin", strokeLinejoin)
      .attr("stroke-linecap", strokeLinecap)
    .selectAll()
    .data([Y, ...[-K, 0, +K].map(K => bollinger(N, K)(Y))])
    .join("path")
      .attr("stroke", (d, i) => colors[i])
      .attr("d", line);

} 



function BrushableBarChart() {
    const margin = { left: 120, top: 20, bottom: 20, right: 20 };
  
    let x = d3.scaleLinear().nice(),
      y = d3.scaleBand().padding(0.2),
      xAttr = "x",
      yAttr = "y",
      id = null,
      width = 600,
      height = 500,
      onBrush = () => {};
  
    //******** Brush******
    var brush = d3.brushY();
  
    const updateBrush = (sel, data) => {
      function brushed(event) {
        const selection = event.selection;
        if (!event.sourceEvent) return;
  
        if (selection) {
          const [y0, y1] = selection;
  
          const isSelected = d =>
            y(d[yAttr]) + y.bandwidth() >= y0 && y(d[yAttr]) <= y1;
  
          const filteredData = sel
            .selectAll(".item")
            .style("fill", "#ccc")
            .filter(isSelected)
            .style("fill", "steelblue")
            .data();
  
          console.log("barchart", y1, y0, filteredData);
  
          onBrush(filteredData);
        } else {
          sel.selectAll(".item").style("fill", "steelblue");
          onBrush(null);
        }
      }
  
      brush
        .extent([
          [0, 0],
          [
            width - margin.left - margin.right,
            height - margin.top - margin.bottom
          ]
        ])
  
        .on("start brush end", brushed);
  
      sel.select(".brush").call(brush);
    };
  
    // A good rule of thumb is that your appends should go here
    const onEnter = enter => {
      const svgEnter = enter.append("svg");
  
      const g = svgEnter.append("g").attr("class", "gDrawing");
      g.append("g")
        .attr("class", "x-axis")
        .append("text")
        .attr("class", "axisLabel");
      g.append("g")
        .attr("class", "y-axis")
        .append("text")
        .attr("class", "axisLabel");
      g.append("g").attr("class", "marks");
  
      g.append("g").attr("class", "brush");
  
      return svgEnter;
    };
    const onUpdate = update => update;
    const onExit = exit => exit.remove();
  
    function chart(sel) {
      sel.each(data => {
        const iwidth = width - margin.left - margin.right,
          iheight = height - margin.top - margin.bottom;
  
        const svg = sel
          .selectAll("svg")
          .data([data])
          .join(onEnter, onUpdate, onExit)
          .attr("viewBox", [0, 0, width, height])
          .attr("width", width)
          .attr("height", height);
        const g = svg
          .select("g")
          .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
        x.domain([0, d3.max(data, d => d[xAttr])]).range([0, iwidth]);
        y.domain(data.map(d => d[yAttr])).range([0, iheight]);
  
        updateBrush(sel, data);
  
        // *** Transition ***
        const t = g.transition().duration(750);
        // Observable only, stop the animation if it isn't done and the cell is disposed
        //invalidation.then(() => svg.interrupt(t));
  
        g.select(".brush").call(brush);
  
        // ***** Axis ******
        g.select(".x-axis")
          .attr("transform", `translate(0, ${iheight})`)
          .transition(t)
          .call(d3.axisBottom(x).ticks(3));
        g.select(".x-axis")
          .select(".axisLabel")
          .style("fill", "black")
          .attr("transform", `translate(${iwidth}, -10)`)
          .style("text-anchor", "end")
          .text(xAttr);
  
        g.select(".y-axis")
          .transition(t)
          .call(d3.axisLeft(y).ticks(3));
        g.select(".y-axis")
          .select(".axisLabel")
          .style("fill", "black")
          .style("text-anchor", "middle")
          .attr("transform", `translate(0, -10)`)
          .text(yAttr);
  
        // ****** Marks ******
        const moveItems = item =>
          item
            .attr("x", 0)
            .attr("width", d => x(d[xAttr]))
            .attr("y", d => y(d[yAttr]));
        g.select(".marks")
          .selectAll(".item")
          .data(data, (d, i) => (id !== null ? d[id] : i))
          .join(
            enter =>
              enter
                .append("rect")
                .attr("class", "item")
                .call(moveItems),
            update => update.call(update => update.transition(t).call(moveItems))
          )
          .attr("height", y.bandwidth())
          .style("fill", "steelblue");
      });
    }
  
    chart.x = function(_) {
      if (!arguments.length) return xAttr;
      xAttr = _;
      return chart;
    };
    chart.y = function(_) {
      if (!arguments.length) return yAttr;
      yAttr = _;
      return chart;
    };
    chart.width = function(_) {
      if (!arguments.length) return width;
      width = _;
      return chart;
    };
    chart.height = function(_) {
      if (!arguments.length) return height;
      height = _;
      return chart;
    };
    chart.onBrush = function(_) {
      if (!arguments.length) return onBrush;
      onBrush = _;
      return chart;
    };
    chart.id = function(_) {
      if (!arguments.length) return id;
      id = _;
      return chart;
    };
  
    return chart;
  }

function LineChart(data, {
    x = ([x]) => x, // given d in data, returns the (temporal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    title, // given d in data, returns the title text
    defined, // for gaps in data
    curve = d3.curveLinear, // method of interpolation between points
    width , // outer width, in pixels
    height , // outer height, in pixels
    marginTop = 0, // top margin, in pixels
    marginRight = 0.1*width, // right margin, in pixels
    marginBottom = 0.1*height, // bottom margin, in pixels
    marginLeft = 0.05*width, // left margin, in pixels 
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    yFormat, // a format specifier string for the y-axis
    yLabel, // a label for the y-axis
    zDomain, // array of z-values
    color = "currentColor", // stroke color of line, as a constant or a function of *z*
    strokeLinecap, // stroke line cap of line
    strokeLinejoin, // stroke line join of line
    strokeWidth = 1, // stroke width of line
    strokeOpacity, // stroke opacity of line
    mixBlendMode = "multiply", // blend mode of lines
    div=undefined,
    voronoi =false// show a Voronoi overlay? (for debugging)
  } = {}) {
    d3.select(div)
      .select('*')
      .remove();
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);
    const O = d3.map(data, d => d);
    if (defined === undefined) defined = (d, i) => !isNaN(X[i]) && !isNaN(Y[i]);
    const D = d3.map(data, defined);


    console.log("X",X);
    console.log("Y",Y);
    console.log("Z",Z);
    // Compute default domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (yDomain === undefined) yDomain = [0, d3.max(Y)];
    if (zDomain === undefined) zDomain = Z;
    zDomain = new d3.InternSet(zDomain);
  
    // Omit any data not present in the z-domain.
    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));
  
    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const xAxis = d3.axisBottom(xScale).ticks(10).tickSizeOuter(0);
    const yAxis = d3.axisLeft(yScale).ticks(3,yFormat);
  
    // Compute titles.
    const T = title === undefined ? Z: title === null ? null : d3.map(data, title);
  
    // Construct a line generator.
    const line = d3.line()
        .defined(i => D[i])
        .curve(curve)
        .x(i => xScale(X[i]))
        .y(i => yScale(Y[i]));
  
    const g = d3.select(div)
        .append('svg')
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .style("-webkit-tap-highlight-color", "transparent")
        .on("pointerenter", pointerentered)
        .on("pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());
  
    // An optional Voronoi display (for fun).
    if (voronoi) g.append("path")
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("d", d3.Delaunay
          .from(I, i => xScale(X[i]), i => yScale(Y[i]))
          .voronoi([0, 0, width, height])
          .render());
    
    g.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);
  
    g.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(voronoi ? () => {} : g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", 0)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(yLabel));
  
    const path = g.append("g")
        .attr("fill", "none")
        .attr("stroke", typeof color === "string" ? color : null)
        .attr("stroke-linecap", strokeLinecap)
        .attr("stroke-linejoin", strokeLinejoin)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
      .selectAll("path")
      .data(d3.group(I, i => Z[i]))
      .join("path")
        .style("mix-blend-mode", mixBlendMode)
        .attr("stroke", typeof color === "function" ? ([z]) => color(z) : null)
        .attr("d", ([, I]) => line(I));
  
    const dot = g.append("g")
        .attr("display", "none");
  
    dot.append("circle")
        .attr("r", 2.5);
  
    dot.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "middle")
        .attr("y", -8);
  
    function pointermoved(event) {
      const [xm, ym] = d3.pointer(event);
      const i = d3.least(I, i => Math.hypot(xScale(X[i]) - xm, yScale(Y[i]) - ym)); // closest point
      path.style("stroke", ([z]) => Z[i] === z ? null : "#ddd").filter(([z]) => Z[i] === z).raise();
      dot.attr("transform", `translate(${xScale(X[i])},${yScale(Y[i])})`);
      if (T) dot.select("text").text("AD["+X[i]+"] the admission amount of ["+T[i]+"] is "+Y[i]);
      g.property("value", O[i]).dispatch("input", {bubbles: true});
    }
  
    function pointerentered() {
      path.style("mix-blend-mode", null).style("stroke", "#ddd");
      dot.attr("display", null);
    }
  
    function pointerleft() {
      path.style("mix-blend-mode", "multiply").style("stroke", null);
      dot.attr("display", "none");
      g.node().value = null;
      g.dispatch("input", {bubbles: true});
    }
    return Object.assign(g.node(),{value:null});
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
            child.x0=x0+child.x0/width*(x1-x0);
            child.x1 = x0 + child.x1 / width * (x1 - x0);
            child.y0 = y0 + child.y0 / height * (y1 - y0);
            child.y1 = y0 + child.y1 / height * (y1 - y0);
        }
    }
    console.log(treemap(data));
    let color = d3.scaleOrdinal(d3.schemePaired);
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
            .attr("fill", d => {return color(d.data.name);})
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