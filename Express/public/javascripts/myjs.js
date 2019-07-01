var points = [];

$.getJSON("/data/data0.json",function(dataset){
	for (i in dataset) {
		var d = dataset[i];
		points.push({"lng": d.lng_bmap, "lat": d.lat_bmap, 
					"id": d.JJDBH, "name": d.AFDD + " [" + d.lm +"]", "time": d.HRSJ,
					"temp": d.tqms + "，" + d.wind_direction + " " + d.wind_power});
	}
	//console.log("points: ", points);
	initMap();//创建和初始化地图
});

//创建标注点并添加到地图中
function addMarker(points) {
	//循环建立标注点
	for(var i=0, pointsLen = points.length; i<pointsLen; i++) {
		var point = new BMap.Point(points[i].lng, points[i].lat); //将标注点转化成地图上的点
		var icon = new BMap.Icon("/images/ball-32.ico",new BMap.Size(32,32));
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
			+'<span style="display: inline-block;">id：</span>' + point.id + '</li>'  
			+'<li style="line-height: 1.4em; font-size: 12px;">'  
			+'<span style="display: inline-block;">名称：</span>' + point.name + '</li>'  
			+'<li style="line-height: 1.4em; font-size: 12px;">'  
			+'<span style="display: inline-block;">时间：</span>' + point.time + '</li>'
			+'<li style="line-height: 1.4em; font-size: 12px;">'  
			+'<span style="display: inline-block;">天气：</span>' + point.temp + '</li>'
			+'</ul>';
	var infoWindow = new BMap.InfoWindow(sContent); //创建信息窗口对象
	thisMarker.openInfoWindow(infoWindow); //图片加载完后重绘infoWindow
}	

//创建和初始化地图函数：
function initMap(){
	createMap();//创建地图
	setMapEvent();//设置地图事件
	addMapControl();//向地图添加控件
}

//创建地图函数：
function createMap(){
	var map = new BMap.Map("dituContent");//在百度地图容器中创建一个地图
	var point = new BMap.Point(117.334482,31.897658);//定义一个中心点坐标
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
