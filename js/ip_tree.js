var point_data_file = "./data/meta-3-7.csv";

var tree_root = {};
tree_root['name'] = "";
tree_root['ip_index'] = 0;
tree_root['children'] = Array(256);
tree_root['color_value'] = 0;

function insert(cur, rest_ip, attr) {
    var t = parseInt(rest_ip[0]);
    rest_ip.shift();
    if(cur.children[t]) {
        if(rest_ip.length == 0) {
            console.log("impossible");
        }
        insert(cur.children[t], rest_ip, attr);
    }
    else {
        if(rest_ip.length == 0) {
            cur.children[t] = {};
            cur.children[t]['name']= cur.name+String(t);
            cur.children[t]['ip_index']= t;
            cur.children[t]['item']= attr;
            cur.children[t]['value']= 1;
            cur.children[t]['color_value'] = 0;
        }
        else if(rest_ip.length == 1) {
            // ip地址的前3位能定位的机器的区域信息
            cur.children[t] = {};
            cur.children[t]['name']= cur.name+String(t)+'.';
            cur.children[t]['children']= new Array(256);
            cur.children[t]['ip_index']= t;
            cur.children[t]['businessunit']= attr['businessunit'];
            cur.children[t]['facility']= attr['facility'];
            cur.children[t]['color_value'] = 0;
            insert(cur.children[t], rest_ip, attr);
        }
        else {
            cur.children[t] = {};
            cur.children[t]['name']= cur.name+String(t)+'.';
            cur.children[t]['children']= new Array(256);
            cur.children[t]['ip_index']= t;
            cur.children[t]['color_value'] = 0;
            insert(cur.children[t], rest_ip, attr);
        }
    }
}
// Below two function cannot use.
function search(cur, rest_ip) {
    if(cur === undefined) {
        return undefined;
    }
    var t = parseInt(rest_ip[0]);
    rest_ip.shift();
    if(rest_ip.length == 0) {
        return cur.children[t].item;
    }
    else {
        return search(cur.children[t], rest_ip);
    }
}
function search_unit(cur, rest_ip) {
    if(cur === undefined) {
        return undefined;
    }
    var t = parseInt(rest_ip[0]);
    rest_ip.shift();
    if(rest_ip.length == 1) {
        return [cur.children[t].businessunit, cur.children[t].facility];
    }
    else {
        return search_unit(cur.children[t], rest_ip);
    }
}

//使用示例
function test_search() {
    var test1 = "172.1.1.45";
    console.log(search(tree_root, test1.split(".")));
    console.log(search_unit(tree_root, test1.split('.')));
}

function test_main() {
    let node_info = d3.csv(point_data_file);
    node_info.then(data=> {
        for(let i=0; i<data.length; ++i) {
            if(i == 0) console.log(data[i]);
            insert(tree_root, String(data[i].ipaddr).split('.'), data[i]);
        }
        console.log(tree_root);
        test_search();
    })
}

// test_main();