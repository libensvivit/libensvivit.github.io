var svg = d3.select('svg');

var margin = { top: 0, right: 150, bottom: 0, left: 150};
var innerWidth = width - margin.left - margin.right;
var innerHeight = height - margin.top - margin.bottom;

var treeLayout = d3.tree().size([innerHeight, innerWidth]);

var zoomG = svg
    .attr('width', width)
    .attr('height', height)
  .append('g');

  var g = zoomG.append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

// ZOOM & PANNING
svg.call(d3.zoom().on('zoom', () => {
  zoomG.attr('transform', d3.event.transform);
}));

d3.json('tree_of_life/data.json')
  .then(data => {
    var root = d3.hierarchy(data);
    var links = treeLayout(root).links();
    var linkPathGenerator = d3.linkHorizontal()
      .x(d => d.y)
      .y(d => d.x);
  
    g.selectAll('path').data(links)
      .enter().append('path')
        .attr('d', linkPathGenerator);
  
    g.selectAll('text').data(root.descendants())
      .enter()
      .append('text')
        .attr('x', d => d.y)
        .attr('y', d => d.x)
        .attr('dy', '0.32em')
        .attr('text-anchor', d => d.children ? 'middle' : 'start')
        .attr('font-size', d => 2.1 - d.depth/2.8 + 'em')
        .text(d => d.data.data.id)
        .on('click', function(d){
          window.open("https://en.wikipedia.org/wiki/" + d.data.data.id);
        });
});