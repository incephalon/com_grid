function createMap(whichTable, whichValue)
{

function FinancialClass(title, value) {
    this.Title = title;
    this.Value = value;
}


var financials = [];
//DPFEAADCK
//DPFFENDT
var valueProperty = whichValue;//"District 2011 Finance: Expenditure by Function-Central Administration Per Pupil, All Funds";
var districts=[
    "HIGHLAND PARK ISD", "DALLAS ISD", "SUNNYVALE ISD", "IRVING ISD", "COPPELL ISD", "DUNCANVILLE ISD", "CEDAR HILL ISD", "GRAND PRAIRIE ISD",
    "CARROLLTON-FARMERS BRANCH ISD", "RICHARDSON ISD", "MESQUITE ISD", "LANCASTER ISD", "GARLAND ISD", "DESOTO ISD"];

/*
 This function gets the id that is used for path elements based on district name
 HTML id attribute can't contain spaces and they are hence replaced by dashes
 */
function getDistrictId(district) {
    return district.replace(/\s/g, "-");
}

// this array receives any number of colors to use on heatmap, from low to high
// the values between those colors will be interpolated
var heatmapColors = [ "#0000ff",  "#000000" ];
//var heatmapColors = [ "#0000ff", "#ffff00", "#ff0000" ];

// construct a color scale for heatmap. domain will be set when the values are in place
// this scale is used further as a function. it can be called with a value argument (within domain)
// and will return a heatmap color (within range)
var colorScale = d3.scale.linear().range(heatmapColors);

// Calling D3 function for JSON retrieval
d3.json("http://commit.azurewebsites.net/api/"+whichTable, function(error, result) {
	console.log(result);
    if (error) {
        console.log(error);
        return;
    }

    // Filter only items with district that is present in districts array
    financials = result.filter(function(d) {
        return districts.indexOf(d.district) >= 0;
    }).map(function(item) { // and for each of them, create a financial object
            return new FinancialClass(item.district, parseFloat(item[valueProperty]));
        });

    // Get max and min values for heatmap
    var minValue = d3.min(financials, function(d) { return d.Value; } );
    var maxValue = d3.max(financials, function(d) { return d.Value; } );

    // construct a domain with the same number of intermediate points as there are colors in the map
    var getIntermediateValue = function(d, i) { return minValue + maxValue * ((.0 + i) / (heatmapColors.length - 1)) };
    colorScale.domain( heatmapColors.map(getIntermediateValue ));

    visualizeData(financials);
});

function visualizeData(data) {
    $(data).each(function(i, financial) {
        // construct a corresponding css selector
        var selector = "path#" + getDistrictId(financial.Title);
        var pathElement = $(selector);
        /*if (!pathElement.length) {
         console.log(selector, "not found");
         } else {
         console.log(selector, "fill set to", colorScale(financial.Value));
         } */

        // set data to element that we want to use on hover
        pathElement.data({
            "district": financial.Title,
            "value": financial.Value
        });

        // apply fill color according to the value
        pathElement.css({
            "fill": colorScale(financial.Value),
            "fill-opacity": 1
        });
    });

    var tooltip = $("#district-tooltip");
    $("svg").delegate("path", "mousemove", function(event) {
        var tooltipContents = $(this).data("district");
        tooltipContents += "<br/>" + $(this).data("value");
        tooltip.html(tooltipContents);
        tooltip.css({
            "left": event.pageX + 5,
            "top": event.pageY - 50
        });
        tooltip.show();
    });
    $("svg").delegate("path", "mouseout", function() {
        tooltip.hide();
    });
}

}