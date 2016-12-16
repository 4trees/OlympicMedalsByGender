var m = {t:50,r:50,b:50,l:50},
    w = document.getElementById('canvas').clientWidth ,
    h = document.getElementById('canvas').clientHeight - m.t - m.b,
    isCollectiveBarChart = true;

console.log(w,h)
console.log(isCollectiveBarChart)
var plot = d3.select('#canvas')
    .append('svg')
    .attr('width', w)
    .attr('height', h + m.t + m.b)
    .append('g').attr('class','plot')
    .attr('transform','translate('+ 0+','+ (m.t/2)+')');
 var key = d3.select('#key')
 	.append('svg')
 	.attr('width',490)
 	.attr('height',h/29)
 	.append('g').attr('class','key')
 	//.attr('transform','translate('+0+','+10+')')

var scaleY=d3.scaleLinear()
	.range([h,0]),
    scaleColor2=d3.scaleLinear()
    .domain([0,.5,1])
    .range(['#2ea7e0','#7f3f98','#e61673']),
	scaleB=d3.scaleLinear()
	.range([0,w/4]),
    scaleR=d3.scaleLinear()
	.range([10,55]),
	scaleL=d3.scaleLinear()
	.domain([0,1])
	.range([w/5,w/5*4]);


var forceY=d3.forceY()
    .y(h/2),
    forceX=d3.forceX()
    .x(w/2);

var Thisyear,Allmen,Allwomen,names,womenpercent;


d3.queue()
    .defer(d3.csv,'../data/allmedalists.csv',parse)
    .defer(d3.csv,'../data/countryname.csv',parsename)
    .await(dataloaded);

function dataloaded(err,total,country){


 	names=d3.map(country,function(d){return d.noc});


var Bygender=d3.nest()
	.key(function(d){return d.year}).sortKeys(d3.ascending)
	.key(function(d){return d.gender})
	.entries(total);

var totalBygender=d3.nest().key(function(d){return d.gender}).rollup(function(d){return d.length}).entries(total)
Allmen=totalBygender[0].value;
Allwomen=totalBygender[1].value;


tip(Allmen,Allwomen,'All');
bar(Bygender,total);

var keys=[];
for(var i=0;i<11;i++){
	keys.push({
		percent:i*.1
	})
}

key.append('g').attr('transform','translate(65,0)')
	.selectAll('.key').data(keys)
	.enter().append('rect').attr('class','key')
	.attr('width',30)
	.attr('height',h/29)
	.attr('transform',function(d,i){return 'translate('+i*31+',0)'})
	.style('fill',function(d){return scaleColor2(d.percent)})
var text=key.append('g').attr('transform','translate(0,12)')
text.append('text').text('100% Men').classed('menbar',true)
text.append('text').text('100% Women').attr('transform','translate('+(31*11+65+2)+',0)').classed('womenbar',true);
console.log(keys);


}

function layout(){
	//console.log(isCollectiveBarChart)
if(isCollectiveBarChart){
	plot.selectAll('.country').remove();
	plot.selectAll('.nodegroup').selectAll('.selected').classed('selected',false);
	plot.selectAll('.nodegroup').selectAll('.node').classed('unenter',true);
	d3.select('#option').classed('hidden',true).classed('show',false);
	d3.select('#all').classed('hidden',true);
	d3.select('#intro').classed('show',true).classed('hidden',false);
	plot.selectAll('.menbar').transition().duration(800).attr('x',function(d){return w/2-scaleB(d.values.length)});
	plot.selectAll('.womenbar').transition().duration(800).attr('x',w/2)
 	d3.selectAll('.custom-tooltip').transition().duration(800).style('top','123px');
 	d3.select('.left').classed('col-lg-offset-1 col-md-offset-1 col-sm-offset-1',true);
 	d3.select('.right').classed('col-lg-offset-9 col-md-offset-9 col-sm-offset-9 col-xs-offset-7',true).classed('col-lg-offset-10 col-md-offset-9 col-sm-offset-9 col-xs-offset-8 text-right',false);

	//isCollectiveBarChart=false;
}
else{
	d3.select('#option').classed('show',true).classed('hidden',false);
	d3.select('#all').classed('hidden',false);
	d3.select('#intro').classed('hidden',true).classed('show',false);
 	d3.selectAll('.custom-tooltip').transition().duration(800).style('top','10px');
 	d3.select('.left').classed('col-lg-offset-1 col-md-offset-1 col-sm-offset-1',false);
 	d3.select('.right').classed('col-lg-offset-9 col-md-offset-9 col-sm-offset-9 col-xs-offset-7',false).classed('col-lg-offset-10 col-md-offset-9 col-sm-offset-9 col-xs-offset-8 text-right',true);
	plot.selectAll('.menbar').transition().duration(800).attr('x',0);
	plot.selectAll('.womenbar').transition().duration(800)
 		.attr('x',function(d){return w-scaleB(d.values.length)})

	//isCollectiveBarChart=true;
}

}

function tip(men,women,year){
var lefttip=d3.select('.left');
	lefttip.select('h3').html(Math.round(men/(men+women)*100)+'%');
	lefttip.select('.info').html(year+' Men');
	lefttip.select('.num').html(men+' medals');
var righttip=d3.select('.right');
	righttip.select('h3').html(Math.round(women/(men+women)*100)+'%');
	righttip.select('.info').html(year+' Women');
	righttip.select('.num').html(women+' medals');
}

function bar(row,total){

scaleY.domain(d3.extent(row,function(d){return d.key}))
scaleB.domain([0,d3.max(row,function(d){return d.values[0].values.length})])


var bar=plot.selectAll('.nodegroup')
	.data(row)
	.enter()
	.append('g').attr('class','nodegroup')
	.attr('transform',function(d){return 'translate('+0+','+scaleY(d.key)+')'})
	.on('click',function(d){ 		
 		plot.selectAll('.nodegroup').selectAll('.selected').classed('selected',false)		
 		d3.select(this).selectAll('.node').classed('selected',true)
 		isCollectiveBarChart=false;
		layout();
 		Thisyear=total.filter(function(el){return el.year==d.key});
 		Comparison(Thisyear);
 		
 	})
 	.on('mouseenter', function(d){
 		plot.selectAll('.nodegroup').selectAll('.node').classed('unenter',false) 		
 		d3.select(this).selectAll('.node').classed('unenter',true)	
 		if(!d.values[1]){
 			tip(d.values[0].values.length,0,d.key)
 		}	
 		else{tip(d.values[0].values.length,d.values[1].values.length,d.key)}

 	
	})
	.on('mouseleave', function(d){
		if (isCollectiveBarChart) {
			d3.selectAll('.node').classed('unenter',true)
		} else {
			d3.selectAll('.node').classed('unenter',false)	 		
		}
		tip(Allmen,Allwomen,'All');
	});


bar.selectAll('.node')
 	.data(function(d){return d.values})
 	.enter()
 	.append('rect')
 	.attr('class',function(d){return d.key=='Men'?'node unenter menbar':'node unenter womenbar'})
 	.attr('width',function(d){return scaleB(d.values.length)})
 	.attr('height',h/29)
 	.attr('x',function(d){return d.key=='Men'?w/2-scaleB(d.values.length):w/2})
 	.on('click',function(d){
 		plot.selectAll('.yearlabel').transition().duration(800)
 			.attr('x',function(d){return scaleB(d.values[0].values.length)+6})
 		
 	})

}


function Comparison(value){
var type=document.getElementsByClassName('active')[0],

	draw=d3.nest()
		.key(function(d){return d[type.id]})
		.entries(value);

	draw.forEach(function(country){		
		country.womenpercent=country.values.filter(function(el){return el.gender=='Women'}).length/country.values.length;
		country.x = scaleL(country.womenpercent); country.y = h/2;
	})
var	textyear=value[0].year,
	texttype=type.innerText,
	texttotal=draw.length;

d3.select('#year').html(textyear);
d3.select('#total').html(texttotal);
d3.select('#type').html(texttype);

	console.log(draw.length)

var collide=d3.forceCollide().radius(function(d){return scaleR(d.values.length)+8});
//var rulefunction=d3.forceManyBody().strength(-40);

scaleR.domain(d3.extent(draw,function(d){return d.values.length}));
scaleL.range([w/5,w/5*4]);


var updatecountry=plot.selectAll('.country')
	.data(draw,function(d){return d.key});
var entercountry=updatecountry.enter()
	.append('g').attr('class','country')
entercountry.append('circle').attr('class','outer')
	.on('mouseenter',function(d){
		console.log(d)
		var biotip=d3.select('.bio-tooltip');
		biotip.select('.percent').classed('men',true).html(Math.round((1-d.womenpercent)*100)+'%')
		biotip.select('.info').html(names.get(d.key)?names.get(d.key).countryname:d.key)
		biotip.select('.theyear').html(d.values[0].year)
		biotip.select('.num').html(d.values.length)
		biotip.style('visibility','visible')
			.transition()
			.style('opacity',1);
		d3.selectAll('.country').transition().style('opacity',function(el){return d.key==el.key?1:.3})
		//d3.select(this).transition().style('stroke-width','3px').style('stroke','#f0f0f0');
	})
	.on('mousemove',function(d){
		var xy=d3.mouse(d3.select('.container-fluid').node());
		var biotip = d3.select('.bio-tooltip')
            .style('left',xy[0]+10+'px')
            .style('top',xy[1]+10+'px');
	})
	.on('mouseleave',function(d){
		var biotip=d3.select('.bio-tooltip');
		biotip.style('visibility','hidden')
              .style('opacity',0);
        d3.selectAll('.country').transition().duration(800).style('opacity',1)
	})
entercountry.append('circle').attr('class','inner')
entercountry.insert('text','.country')
var country=entercountry
	.merge(updatecountry)
	country.select('.outer')
	.attr('r',function(d){return scaleR(d.values.length)})
	.style('fill',function(d){
		return scaleColor2(d.womenpercent);			
	})
	country.select('.inner')
	.attr('r',function(d){return scaleR(d.values.length)*.382}).style('fill','#f7f7f7')

	country.select('text')
	.text(function(d){var name=names.get(d.key);return name?name.countryname:d.key;})

updatecountry.exit().remove();


var simulation=d3.forceSimulation(draw)
	//.force('rule',rulefunction)
	.force('collide',collide)
	.force('positionX',forceX)
    .force('positionY',forceY)
	.on('tick', function(){
		plot.selectAll('.country')
		.attr('transform',function(d){return 'translate('+d.x+','+d.y+')'});
		//plot.selectAll('text')
		//.attr('transform',function(d){return 'translate('+d.x+','+0+')'})
	})

}


function parse(d){
	return {
		year: +d['Edition'],
		discipline: d['Discipline'],
		noc: d['NOC'],
		gender: d['Gender'],
		eventgenter:d['Event_gender'],
		medal:d['Medal']
	}
}
function parsename(d){
	return{
		noc:d['NOC'],
		countryname:d['Country']
	}
}