// splitter between docking items

IG$.sp/*docksplit*/ = function(config) {
	var me = this;
	
	me.p1/*docmain*/ = config.docmain;
	me.panel = config.panel;
	me.p5/*direction*/ = config.direction;
	
	me.p6/*_initPos*/ = null;
	me.p7/*_ghost*/ = null;
	
	me.init();
}

IG$.sp/*docksplit*/.prototype = {
	init: function() {
		var me = this,
			cursor = me.p5/*direction*/ == "horizontal" ? "n-resize" : "e-resize";
			
		me.spui = $("<div class='dock-splitter'></div>")
			.attr({unselectable:"on"})
			.css({position: "absolute"})
			.appendTo(me.p1/*domain*/.box)
			.hide();
			
		me.panel._SP = me.panel._SP || [];
		me.panel._SP.push(me);
		
		if (!ig$._fix_split)
		{
			me.spui.css({cursor: cursor, "user-select": "none", "-webkit-user-select": "none","-khtml-user-select": "none", "-moz-user-select": "none"});
			me.spui.bind("mousedown", function(event) {
				me.l2/*_startDrag*/.call(me, event);
			});
		}
		else
		{
			me.spui.css({"backgroundColor": "transparent"});
		}
	},
	
	setV: function(v) {
		var me = this;
		
		if (v && !ig$._fix_split)
		{
			me.spui.show();
		}
		else
		{
			me.spui.hide();
		}
	},
	
	l2/*_startDrag*/: function(event) {
		var me = this;
		
		if(event.target != me.spui[0])
			return;
			
		event.stopPropagation();
		event.preventDefault();
		
		me.p7/*_ghost*/ = me.p7/*_ghost*/ || me.spui.clone(false).appendTo(me.p1/*domain*/.box);
		me.p7/*_ghost*/.css("-webkit-user-select", "none")
		me.p8/*_poff*/ = me.p1/*domain*/.box.offset();
		me.p6/*_initPos*/ = me.spui.position();

		function __doDrag(event) {
			event.stopPropagation();
			event.preventDefault();
			me.l3/*_doDrag*/.call(me, event);
		}
		
		function __endDrag(event) {
			event.stopPropagation();
			event.preventDefault();
			me.l4/*_endDrag*/.call(me, event);
			
			$(document).unbind("mousemove", __doDrag).unbind("mouseup", __endDrag);
		}
		
		$(document)
			.bind("mousemove", __doDrag)
			.bind("mouseup", __endDrag);
	},
	
	l3/*_doDrag*/: function(event) {
		var me = this,
			incr;
			
		if (!me.p7/*_ghost*/) 
			return;
		
		event.stopPropagation();
			
		if (me.p5/*direction*/ == "horizontal")
		{
			incr = event.pageY - me.p6/*_initPos*/.top - me.p8/*_poff*/.top;
			me.p7/*_ghost*/.css({top: me.p6/*_initPos*/.top + incr});
		}
		else
		{
			incr = event.pageX - me.p6/*_initPos*/.left - me.p8/*_poff*/.left;
			me.p7/*_ghost*/.css({left: me.p6/*_initPos*/.left + incr});
		}
	},
	
	l4/*_endDrag*/: function(event) {
		event.stopPropagation();
		
		if (!this.p7/*_ghost*/)
			return;
		
		var me = this,
			g = me.p7/*_ghost*/,
			goff = g.offset(),
			moff = me.p1/*domain*/.box.offset(),
			p = {
				left: goff.left - moff.left,
				top: goff.top - moff.top
			},
			incr, i, flsize = 0, fisize = 0,
			arr,
			base1 = (me.p5/*direction*/ == "horizontal" ? "top" : "left"),
			base2 = (me.p5/*direction*/ == "horizontal" ? "height" : "width"),
			base3 = (me.p5/*direction*/ == "horizontal" ? "h" : "w"),
			pnl,
			qindex = -1,
			pbefore,
			panel = me.panel,
			_pi = 0;
			_pitem = panel.parent,
			mval = 40;
		
		incr = p[base1] - me.p6/*_initPos*/[base1];
		
		for (i=0; i < _pitem.children.length; i++)
		{
			if (_pitem.children[i] == panel)
			{
				_pi = i;
				break;
			}
		}
		
		pbefore = _pitem.children[_pi-1];
		
		if (panel.lt.pos[base3] - incr < mval)
		{
			incr = panel.lt.ubody[base3] - mval;
		}
		
		if (pbefore.lt.pos[base2] + incr < mval)
		{
			incr = mval - pbefore.lt.pos[base3];
		}
		
		pbefore.lt.pos[base3] = pbefore.lt.pos[base3] + incr;
		panel.lt.pos[base3] = panel.lt.pos[base3] - incr;
		
		pbefore.lt.ubody.lt[base3] = pbefore.lt.pos[base3];
		panel.lt.ubody.lt[base3] = panel.lt.pos[base3];
		
		me.p7/*_ghost*/.remove(); 
		me.p7/*_ghost*/ = null;	
		
		me.p1/*docmain*/.resizeContainer.call(me.p1/*domain*/, [pbefore, panel]);
		
		me.p1/*docmain*/.updateDisplay.call(me.p1/*docmain*/, true);
	},
	
	l5/*remove*/: function() {
		var me = this;
		me.spui.remove();
	},
	
	validate: function() {
		var me = this,
			p5/*direction*/ = me.p5/*direction*/,
			gap = 1, m = 1,
			px=0, py=0, pw=0, ph=0,
			mx, my, mw, mh,
			i,
			panel = me.panel,
			pos,
			ubody = panel.lt.ubody;
		
		if (panel)
		{
			pos = panel.lt.pos;
			
			switch (me.p5/*direction*/)
			{
			case "vertical":
				px = pos.x;
				py = pos.y;
				pw = gap * 2;
				ph = pos.h;
				break;
			case "horizontal":
				px = pos.x;
				py = pos.y;
				pw = pos.w;
				ph = gap * 2;
				break;
			}
				
			me.spui.css({top: py, left: px, width: pw, height: ph});
		}
	}
}