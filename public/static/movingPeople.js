positionsX = [400,200,400,200,500,300];
positionsY= [200,200,50,200,200,400];

circleMoveIndex = 0
//Draw a Circle  (will later be a bunch of them having a party
var circle = peopleLayer.append("circle") .attr("cx", 100)
  .attr("cy", 100) .attr("r", 12)
  .style("fill","#D25252")
  .style("stroke","black")
  .style("stroke-width","4px")
  ;
function moveCirce(dur){
	//d3.select("circle").transition()
	circle.transition()
			.attr("cx",positionsX[circleMoveIndex])
			.attr("cy",positionsY[circleMoveIndex])
			.ease("elastic")
			.duration(dur);
	circleMoveIndex += 1;
	if (circleMoveIndex == positionsX.length)
		circleMoveIndex = 0;
}
function showPeople(b){
	circle.style("visibility", function() {return b == true ? "visible" : "hidden";});
}