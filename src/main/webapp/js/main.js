// create boguenon instances
var IG$ = window.IG$ || {};

$(document).ready(function() {
	$("#lpt", "#loading").css("width", "100%");
	
	$("#loading").fadeOut(2000, function() {
		$("#loading").remove();
		$("#loading-mask").remove();
		
		var panel = this,
			dzone = new IG$.boDockZone($("#maincontent")),
			layoutinfo = {
				type: "mondrian",
				draggable: false,
				objtype: "_dc",
				_direction: 0, // 0 horizontal, 1 vertical
				width: null,
				height: null,
				children: []
			},
			ctrls = {};

		dzone.editmode = true;
		
		$("li", "#widgets").draggable({
			helper: "clone",
			drag: function(event, ui) {
				if (dzone._accept)
				{
					dzone.dragOver.call(dzone, event, ui, dzone._accept);
				}
			}
		});
		
		dzone.makeLayout.call(dzone, panel, layoutinfo, ctrls);
	});
});