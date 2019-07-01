var data = [];
var timemin = 0;
var timemax = 0;

var points = [];

$.getJSON("/data/data0.json",function(dataset){
	var lng_min = dataset[0].lng_bmap, lng_max = dataset[0].lng_bmap, lat_min = dataset[0].lat_bmap, lat_max = dataset[0].lat_bmap;
	timemin = (new Date(dataset[0].HRSJ)).getTime();
	timemax = (new Date(dataset[0].HRSJ)).getTime();
	for (i in dataset) {
		var d = dataset[i];
		if (i!=0) {
			if (d.lng_bmap < lng_min)
				lng_min = d.lng_bmap;
			else if (d.lng_bmap > lng_max)
				lng_max = d.lng_bmap;
			if (d.lat_bmap < lat_min)
				lat_min = d.lat_bmap;
			else if (d.lat_bmap > lat_max)
				lat_max = d.lat_bmap;
			if ((new Date(d.HRSJ)).getTime() < timemin)
				timemin = (new Date(d.HRSJ)).getTime();
			else if ((new Date(d.HRSJ)).getTime() > timemax)
				timemax = (new Date(d.HRSJ)).getTime();
		}
		points.push({"lng": d.lng_bmap, "lat": d.lat_bmap,
					"id": d.JJDBH, "name": d.AFDD,
					"road": d.lm + " (" + d.rid +")",
					"time": d.HRSJ.split(" ")[1],
					"date": d.HRSJ_DATE.replace("-0","-").replace("-0","-").replace("-","年 ",1).replace("-","月 ",1) + "日",
					"temp": d.tqms + "，" + d.wind_direction + " " + d.wind_power});
	}
	// console.log("lng: " + lng_min + " - " + lng_max + ", lat: " + lat_min + " - " + lat_max);
	// console.log("lng: " + (parseFloat(lng_min)+parseFloat(lng_max))/2 + ", lat: " + (parseFloat(lat_min)+parseFloat(lat_max))/2);
	//console.log("points: ", points);
	initMap((parseFloat(lng_min)+parseFloat(lng_max))/2, (parseFloat(lat_min)+parseFloat(lat_max))/2);//创建和初始化地图
	data = dataset;
	initSelector();
});

//创建标注点并添加到地图中
function addMarker(points) {
	//循环建立标注点
	for(var i=0, pointsLen = points.length; i<pointsLen; i++) {
		var point = new BMap.Point(points[i].lng, points[i].lat); //将标注点转化成地图上的点
		var icon = new BMap.Icon("/images/warning.ico",new BMap.Size(32,32));
		var marker = new BMap.Marker(point, {icon: icon}); //将点转化成标注点
		map.addOverlay(marker);  //将标注点添加到地图上
		//添加监听事件
		(function() {
			var thePoint = points[i];
			marker.addEventListener("click",
				function() {
					showInfo(this,thePoint);
				});
		})();  
	}
}
function showInfo(thisMarker,point) {
	//获取点的信息
	var sContent = '<ul style="margin: 0px 0px 0px 4px; padding: 0px;">'  
			+'<li style="line-height: 1.4em; font-size: 12px;">' 
			+'<span style="display: inline-block;">接警单编号：\t</span><b>' + point.id + '</b></li>'  
			+'<li style="line-height: 1.4em; font-size: 12px;">' 
			+'<span style="display: inline-block;">事故地点：\t</span>' + point.name + '</li>'  
			+'<li style="line-height: 1.4em; font-size: 12px;">'
			+'<span style="display: inline-block;">所属街道：\t</span>' + point.road + '</li>'  
			+'<li style="line-height: 1.4em; font-size: 12px;">'
			+'<span style="display: inline-block;">接警时间：\t</span>' + point.time + '</li>'
			+'<li style="line-height: 1.4em; font-size: 12px;">' 
			+'<span style="display: inline-block;">接警日期：\t</span>' + point.date + '</li>'
			+'<li style="line-height: 1.4em; font-size: 12px;">' 
			+'<span style="display: inline-block;">天气状况：\t</span>' + point.temp + '</li>'
			+'</ul>';
	var infoWindow = new BMap.InfoWindow(sContent); //创建信息窗口对象
	thisMarker.openInfoWindow(infoWindow); //图片加载完后重绘infoWindow
}	

//创建和初始化地图函数：
function initMap(lng, lat){
	createMap(lng, lat);//创建地图
	setMapEvent();//设置地图事件
	addMapControl();//向地图添加控件
}

//创建地图函数：
function createMap(lng, lat){
	var map = new BMap.Map("dituContent");//在百度地图容器中创建一个地图
	var point = new BMap.Point(lng,lat);//定义一个中心点坐标
	map.centerAndZoom(point,12);//设定地图的中心点和坐标并将地图显示在地图容器中
	window.map = map;//将map变量存储在全局
	addMarker(points);
}

//地图事件设置函数：
function setMapEvent(){
	map.enableDragging();//启用地图拖拽事件，默认启用(可不写)
	map.enableScrollWheelZoom();//启用地图滚轮放大缩小
	map.enableDoubleClickZoom();//启用鼠标双击放大，默认启用(可不写)
	map.enableKeyboard();//启用键盘上下左右键移动地图
}

//地图控件添加函数：
function addMapControl(){
	//向地图中添加缩放控件
	var ctrl_nav = new BMap.NavigationControl({anchor:BMAP_ANCHOR_TOP_LEFT,type:BMAP_NAVIGATION_CONTROL_LARGE});
	map.addControl(ctrl_nav);
	//向地图中添加缩略图控件
	var ctrl_ove = new BMap.OverviewMapControl({anchor:BMAP_ANCHOR_BOTTOM_RIGHT,isOpen:1});
	map.addControl(ctrl_ove);
	//向地图中添加比例尺控件
	var ctrl_sca = new BMap.ScaleControl({anchor:BMAP_ANCHOR_BOTTOM_LEFT});
	map.addControl(ctrl_sca);
}

//加载时间轴
function initSelector() {
	// console.log((new Date(timemin)).toLocaleString() + " - " + (new Date(timemax)).toLocaleString());
	var width = 400;
	var height = 120;
	var svg = d3.select("#interaction").append("svg")
										.attr("id", "svg0")
										.attr("width", width + 26)
										.attr("height", height);
		
	var step = parseInt((timemax - timemin + 1000) / 100);
	var dataset = new Array(100);
	for (var i = 0; i < 100; i++)
		dataset[i] = 0;

	for (i in data) {
		var d = data[i];
		var flag = parseInt(((new Date(d.HRSJ)).getTime() - timemin) / step);
		// flag = flag >= 100 ? 99 : flag;
		dataset[flag]++;
	}
	// console.log(dataset);

	//计算数据的最大值
	var datamax = d3.max(dataset);

	var xScale = d3.scale.linear()
					.domain([timemin, timemax])
					.range([0, width]);

	var yScale = d3.scale.linear()
					.domain([0, datamax*1.6])
					.range([height, 0]);

	/*添加矩形*/
	//定义矩形所占的宽度（包括空白）,即从前一个矩形开始位置到后一个矩形开始位置的距离
	var rectStep = width/100;
	//定义矩形的宽度（不包括空白）
	var rectWidth = width/160;

	//选择区域
	var dragging = "none";

	//选择空选择集，利用enter补足元素
	var rect = svg.selectAll("rect")
					.data(dataset)
					.enter()
					.append("rect")							//补足元素
					.attr("fill","steelblue")				//设置填充色
					.attr("x", function(d,i) {				//设置矩形的x坐标
						return xScale(timemin+i*step) + 10;
					})
					.attr("y", function(d) {				//设置矩形的y坐标
						return yScale(d) - 10;
					})
					.attr("width",rectWidth)
					.attr("height",function(d) {
						return height - yScale(d);			//以所绑定数据作为矩形的高
					})
					.append("title")
						.text(function(d,i){
							return "FROM{" + (new Date(timemin + i * step)).toLocaleString().replace(" ","-")
							+ "}TO{" + (new Date(timemin + (i+1) * step - 1)).toLocaleString().replace(" ","-") + "}";
						});

	//水平基准线
	var focus_y = svg.append("line")
						.attr("x1", -20)
						.attr("x2", width+20)
						.attr("y1", 10)
						.attr("y2", 10)
						.attr("style", "stroke: white;");
	//垂直基准线
	var focus_x = svg.append("line")
						.attr("x1", 20)
						.attr("x2", 20)
						.attr("y1", -20)
						.attr("y2", height+20)
						.attr("style", "stroke: white;");
	
	var selected = svg.append("rect")
						.attr("id", "area")
						.attr("fill","rgba(0,100,220,0.2)")
						.attr("x", 10)
						.attr("y", yScale(datamax*1.6) - 10)
						.attr("width", xScale(timemax))
						.attr("height", height-yScale(datamax*1.6))
						.on("mousedown",function(){
							var dx = parseInt(d3.event.pageX-document.getElementById("area").getBoundingClientRect().x);
							if (dx>=-10 && dx <=10) {
								dragging = "left";
							}
							else {
								dx = parseInt(d3.event.pageX-document.getElementById("area").getBoundingClientRect().x
										-d3.select(this).attr("width"));
								if (dx>=-10 && dx <=10)
									dragging = "right";
							}
							console.log(dragging);
						})
						.on("mousemove",function(){
							if (dragging=="none")
								return;
							console.log("moving");
							var dx = parseInt(d3.event.pageX-document.getElementById("area").getBoundingClientRect().x);
							if (dragging=="left") {
								d3.select(this).attr("x", dx).attr("width", dx);
							}
							else if (dragging=="right") {
								dx = dx - d3.select(this).attr("x");
								d3.select(this).attr("width", dx);
							}
						})
						.on("mouseup",function(){
							console.log("up");
							dragging = "none";
						})
						.on("mouseout",function(){
							console.log("out");
							dragging = "none";
						});
	//时间显示
	var labeltime = svg.append("text")
						.attr("x", width+10)
						.attr("y", 10)
						.attr("fill", "white")
						.attr("font-size", "12px")
						.attr("text-anchor", "end")
						.text("time");
	//鼠标跟随
	svg.on("mousemove",function(){
		var dx = parseInt(d3.event.pageX-document.getElementById("svg0").getBoundingClientRect().x) - 3;
		var dy = parseInt(d3.event.pageY-document.getElementById("svg0").getBoundingClientRect().y) - 3;
		focus_y.attr("y1", dy).attr("y2", dy);
		focus_x.attr("x1", dx).attr("x2", dx);
		labeltime.text(new Date(timemin + (dx - 10) / rectStep * step)).toLocaleString().replace(" ","-");
	});
}