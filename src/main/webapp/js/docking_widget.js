IG$.dockingWidget = function(owner, docid, config) {
	var me = this,
		btnarea;
	
	me.owner = owner;
	me.container = false;
	me.showtitle = true;
	me._v = true;
	me.visible = true;
	
	me.x = (config && config.x) ? config.x : null;
	me.y = (config && config.y) ? config.y : null;
	me.width = (config && config.width) ? config.width : null;
	me.height = (config && config.height) ? config.height : null;
	me.fixed_width = false;
	me.fixed_height = false;
	me.hidetitle = false;
	// me.playout = "V";

	me.docid = docid;
	me.activeTab = 0;
	me.dragging = false;
	
	me.box = $("<div class='idv-dk-main' " + docid + "></div>").css({
		position: "absolute", 
		width: (IG$.x_10/*jqueryExtension*/._w(owner.box) || 100), 
		height: (IG$.x_10/*jqueryExtension*/._h(owner.box) || 100)
	}).dselect();
	me.binner = $("<div class='dock_inner'></div>").appendTo(me.box).dselect();
	me.box_title = $("<div class='dock_title doc_title_normal'></div>").appendTo(me.binner).dselect();
	$("<div class='dock_title_icon'></div>").appendTo(me.box_title);
	$("<div class='dock_title_text'><span id='dock_title_text'>&nbsp;</span></div>").appendTo(me.box_title);
	me.btnarea = btnarea = $("<div class='dock_title_btnarea'></div>").appendTo(me.box_title);
	
	me.btnmap = {};
	
	me.box_container = $("<div class='dock_content'></div>").appendTo(me.binner).dselect();
	
	config = config || {};
	config.draggable != false && me.box.draggable({
		handle: me.box_title,
		
		delay: 300,
		distance: 5,
		zIndex: 99,
		
		start: function(event, ui) {
			if (!owner.editmode)
				return false;
				
			me.dragging = true;
			owner.showDropProxy.call(owner, event, ui);
		},
		drag: function(event, ui) {
			owner.dragOver.call(owner, event, ui);
		},
		stop: function(event, ui) {
			owner.l18/*dragStop*/.call(owner, event, ui);
			me.dragging = false;
		}
	});
	
	me.box.bind("resize", function() {
		me.l2/*resizeH*/.call(me);
	});
	
	me._dzid = me.owner._dzid + "_" + me.docid;

	me.l2/*resizeH*/();
	
	if (config)
	{
		me.fixed_width = typeof(config.fixed_width) != "undefined" ? config.fixed_width : me.fixed_width;
		me.fixed_height = typeof(config.fixed_height) != "undefined" ? config.fixed_height : me.fixed_height;
		me.showtitle = !config.hidetitle;
		me.showTitle(me.showtitle);
		me.setTitle(config.title);
		me.objtype = me.objtype || config.objtype;
	}
	
	me.init();
}

IG$.dockingWidget.prototype = {
	validateProperty: function() {
		var me = this;
		
		switch (me.objtype)
		{
		case "SHEET":
		case "FILTER":
		case "TEXT":
		case "RPT_VIEW":
			me.container = false;
			me.children = [];
			break;
		case "PANEL":
		case "_dc":
		case "TAB":
			me.container = true;
			me._direction = 0; // 0 : horizontal, 1 : vertical
			me.children = [];
			break;
		}
	},
	
	setToolButtons: function(btns) {
		var me = this,
			mbtns = btns || [],
			owner = me.owner,
			btnarea = me.btnarea,
			btnmap,
			sheet_toolbar = ig$.sheet_toolbar,
			i;
		
		btnmap = me.btnmap = {};
		btnarea.empty();
		
		if (me.objtype == "SHEET")
		{
			mbtns.push({
				name: "viewgrid",
				hidden: true,
				cls: "idv-dk-btn-vgrid",
				handler: function(panel) {
					var p = this;
					p.view.updateViewMode.call(p.view, "grid");
				},
				scope: me
			});
		
			mbtns.push({
				name: "viewchart",
				hidden: true,
				cls: "idv-dk-btn-vchart",
				handler: function(panel) {
					var p = this;
					p.view.updateViewMode.call(p.view, "chart");
				},
				scope: me
			});

			mbtns.push({
				name: "viewrstat",
				hidden: true,
				cls: "idv-dk-btn-vrstat",
				handler: function(panel) {
					var p = this;
					p.view.updateViewMode.call(p.view, "r");
				},
				scope: me
			});
		}
		
		mbtns.push({
			name: "exp_excel",
			hidden: true,
			cls: "idv-dk-btn-e-xls",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "EXCEL");
			},
			scope: me
		});

		mbtns.push({
			name: "exp_pdf",
			hidden: true,
			cls: "idv-dk-btn-e-pdf",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "PDF");
			},
			scope: me
		});
		
		mbtns.push({
			name: "jasper_excel",
			hidden: true,
			cls: "idv-dk-btn-e-xls",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "JASPER_EXCEL");
			},
			scope: me
		});

		mbtns.push({
			name: "jasper_pdf",
			hidden: true,
			cls: "idv-dk-btn-e-pdf",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "JASPER_PDF");
			},
			scope: me
		});
		
		mbtns.push({
			name: "jasper_ppt",
			hidden: true,
			cls: "idv-dk-btn-e-pdf",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "JASPER_PPT");
			},
			scope: me
		});
		
		mbtns.push({
			name: "jasper_docx",
			hidden: true,
			cls: "idv-dk-btn-e-pdf",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "JASPER_DOCX");
			},
			scope: me
		});
		
		mbtns.push({
			name: "jasper_rtf",
			hidden: true,
			cls: "idv-dk-btn-e-pdf",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "JASPER_RTF");
			},
			scope: me
		});
		
		mbtns.push({
			name: "jasper_html",
			hidden: true,
			cls: "idv-dk-btn-e-pdf",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "JASPER_HTML");
			},
			scope: me
		});
		
		mbtns.push({
			name: "office_0",
			hidden: true,
			cls: "idv-dk-btn-e-off-0",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "OFFICE_0");
			},
			scope: me
		});
		
		mbtns.push({
			name: "office_1",
			hidden: true,
			cls: "idv-dk-btn-e-off-1",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "OFFICE_1");
			},
			scope: me
		});
		
		mbtns.push({
			name: "office_2",
			hidden: true,
			cls: "idv-dk-btn-e-off-1",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "OFFICE_2");
			},
			scope: me
		});
		
		mbtns.push({
			name: "office_3",
			hidden: true,
			cls: "idv-dk-btn-e-off-1",
			handler: function(panel) {
				var p = this;
				p.view.exportSheet.call(p.view, "OFFICE_3");
			},
			scope: me
		});
		
		mbtns.push({
			name: "exp_csv",
			hidden: true,
			cls: "idv-dk-btn-e-csv",
			handler: function(panel) {
				var p = this;
				p.view.downloadAllCSV.call(p.view, "CSV");
			},
			scope: me
		});
		
		if (ig$.features && ig$.features.ml && me.objtype == "SHEET")
		{
			mbtns.push({
				name: "ml_learn",
				cls: "ig_ml_learn",
				hidden: false,
				handler: function(panel) {
					var p = this;
					p.view._Ip7/*ml_learn*/.call(p.view);
				}
			});
		}
		
		if (sheet_toolbar && sheet_toolbar.length)
		{
			$.each(sheet_toolbar, function(i, btn) {
				mbtns.push({
					name: btn.key,
					label: btn.label,
					hidden: true,
					cls: btn.cls,
					handler: function(panel) {
						try
						{
							if (btn.handler)
							{
								btn.handler.call(btn.scope || me.view, me.view, btn.key);
							}
						}
						catch (e)
						{
						}
					},
					scope: me
				});
			});
		}
		
		mbtns.push({
			name: "pivot",
			hidden: true,
			cls: "icon-toolbar-pivot",
			handler: function(panel) {
				var p = this.owner;
				
				p.configDock.call(p, panel.docid, "config_pivot");
			},
			scope: me
		});

		mbtns.push({
			name: "config",
			hidden: true,
			cls: "icon-grid-config",
			handler: function(panel) {
				var p = this.owner;
				
				p.configDock.call(p, panel.docid, "config_doc");
			},
			scope: me
		});
		
		mbtns.push({
			name: "maximize",
			cls: "dock_maximize_button",
			handler: function(panel) {
				var p = this.owner;
				p.maximizeWidget.call(p, panel.docid);
			},
			scope: me
		});
		
		mbtns.push({
			name: "close",
			hidden: true,
			cls: "dock_close_button",
			handler: function(panel){
				var p = this.owner;
				p.closeWidget.call(p, panel.docid);
			},
			scope: me
		});
		
		$.each(mbtns, function(i, btn) {
			var el = $("<div class='dock_button " + (btn.cls || "") + "'></div>").appendTo(btnarea).dselect();
			btn.el = el;
			if (btn.label)
			{
				el.append("<span>" + btn.label + "</span>");
			}
			btn.el[btn.hidden == true ? "hide" : "show"]();
			btnmap[btn.name || "btn_" + i] = btn;
			el.bind("click", function(ev) {
				if (btn.handler)
				{
					btn.handler.call(btn.scope || me, me);
				}
				else
				{
					me.box.trigger("buttonclick", {
						panel: me,
						button: btn
					});
				}
			});
		});
	},
	dropIn: function(m) {
		var me = this,
			owner = me.owner,
			binner = me.binner,
			x = 5,
			y = 5,
			w = IG$.x_10/*jqueryExtension*/._w(binner) - 10,
			h = IG$.x_10/*jqueryExtension*/._h(binner) - 10;
			
		switch (m)
		{
		case "right":
			x = w / 2;
		case "left":
			w = w / 2;
			break;
		case "bottom":
			y = h / 2;
		case "top":
			if (m == "top")
			{
				y += 20;
			}
			h = h / 2;
			break;
		case "inner":
			break;
		}
		
		owner.showDrop.call(owner, me, {
			top: y,
			left: x,
			width: w,
			height: h
		}, m);
	},
	dropOut: function() {
		var me = this;
		me.owner.sdph/*hidedropproxy*/.call(me.owner, me);
	},
	
	dropHit: function(pox, getpos, psearch, gap) {
		var me = this,
			_pc = me._pc,
			pp,
			r,
			px = {
				x: pox.x + gap.left,
				y: pox.y + gap.top
			},
			mh, mw,
			padding = 0,
			margin = 0,
			bbox = me.bbox,
			sx, sy, tx, ty;
		
		// margin = psearch ? 0.4 : margin;
		
		if (bbox.x < px.x && px.x < bbox.x + bbox.w && bbox.y < px.y && px.y < bbox.y + bbox.h)
		{
			r = "none";
			
			if (getpos && me.objtype != "_dc")
			{
				pp = _pc.parent;
				
				while (pp)
				{
					if (pp.objtype == "PANEL" || pp.objtype == "TAB")
					{
						padding += 20;
					}
					
					pp = pp.parent;
					
					if (pp && pp == pp.parent)
					{
						break;
					}
				}
				
				margin = (2 * padding) * 0.3;
				
				if (me.objtype == "PANEL" || me.objtype == "TAB")
				{
					margin = 20;
					
					sx = bbox.x + padding;
					tx = bbox.x + padding + 20;
					sy = bbox.y + padding + 20;
					ty = bbox.y + bbox.h - padding * 2 - 20;
					
					if (sy < px.y && px.y < ty)
					{
						if (sx < px.x && px.x < tx)
						{
							r = "left";
						}
						else if (bbox.x + bbox.w - padding * 2 - 20 < px.x && px.x < bbox.x + bbox.w - padding * 2)
						{
							r = "right";
						}
					}
					else if (sx < px.x && px.x < bbox.x + bbox.w - padding * 2)
					{
						if (bbox.y + padding < px. y && px.y < sy)
						{
							r = "top";
						}
						else if (bbox.y + bbox.h - padding * 2 - 20 < px.y && px. y < bbox.y + bbox.h - padding * 2)
						{
							r = "bottom";
						}
					}
					
					if (me.objtype == "TAB" && r == "none")
					{
						me._pc.children = me._pc.children || [];
						
						if (me._pc.children.length > 0)
						{
							if (bbox.x < px.x && px.x < bbox.x + bbox.w &&
							    bbox.y + 20 < px.y && px.y < bbox.y + 40)
							{
								r = "inner";
							}
						}
						else
						{
							r = "inner";
						}
					}
					else if (me.objtype == "PANEL" && r == "none")
					{
						if (me._pc.children.length > 0 && me._pc.children[0].objtype == "_dc" && me._pc.children[0].children.length)
						{
							r = "_panel_";
						}
						else 
						{
							r = "inner";
						}
					}
				}
				else
				{
					margin = 0.3;
					
					mh = bbox.h - padding * 2;
					mw = bbox.w - padding * 2;
					
					sx = bbox.x + padding;
					sy = bbox.y + padding + mh * margin;
					
					tx = bbox.x + padding + mw * margin;
					ty = bbox.y + bbox.h - mh * margin - padding;
					
					if (sy < px.y && px.y < ty)
					{
						if (sx < px.x && px.x < tx)
						{
							r = "left";
						}
						else if (bbox.x + bbox.w - mw * margin - padding < px.x && px.x < bbox.x + bbox.w - padding)
						{
							r = "right";
						}
					}
					else if (tx < px.x && px.x < bbox.x + bbox.w - mw * margin - padding)
					{
						if (bbox.y + padding < px.y && px. y < bbox.y + padding + mh * margin)
						{
							r = "top";
						}
						else if (bbox.y + bbox.h - mh * margin - padding < px. y && px.y < bbox.y + bbox.h - padding)
						{
							r = "bottom";
						}
					}
				}
			}
		}
		return r;
	},
	
	init: function() {
		var me = this;

		me.setToolButtons();
	},
	
	l2/*resizeH*/: function() {
		var me = this,
			w = IG$.x_10/*jqueryExtension*/._w(me.binner),
			h = IG$.x_10/*jqueryExtension*/._h(me.binner),
			bh = (me._v == true) ? IG$.x_10/*jqueryExtension*/._h(me.box_title) + 3: 0,
			box_container = me.box_container,
			r2, r2w, r2h;
		
		if (w > 0 && h - bh > 0)
		{
			box_container.height(h-bh);
			
			if (me.view)
			{
				r2 = me.view.renderTo;
				if (r2)
				{
					r2 = $(r2);
					r2w = IG$.x_10/*jqueryExtension*/._w(r2);
					r2h = IG$.x_10/*jqueryExtension*/._h(r2);
					if (r2w != w && r2h != h-bh)
					{
						IG$.x_10/*jqueryExtension*/._w(r2, w);
						IG$.x_10/*jqueryExtension*/._h(r2, h-bh);
					}
				}
				
				if (me.objtype != "_dc")
				{
					me.view.setSize(w, h-bh, true);
					box_container.hide().show(0);
				}
			}
		}
	},
	
	setTitle: function(text) {
		var me = this,
			t;
		
		me.title = text;
		
		me.applyFlt();
	},
	
	_title: function(t) {
		var me = this,
			tdiv = $("#dock_title_text", me.box_title);
		
		tdiv.html(t || "&nbsp;");
		
		me.box.trigger("titlechange", {
			panel: me
		});
	},
	
	formatTitle: function(text) {
		var me = this,
			param = me._param,
			n, m,
			pname;
		
		text = IG$._rrcs(me, text);
		
		n = text ? text.lastIndexOf("${") : -1;
		
		while (n > -1)
		{
			m = text.indexOf("}", n);
			
			if (m > -1)
			{
				pname = text.substring(n+2, m);
				
				text = text.substring(0, n) + (pname && param && param[pname] ? param[pname] : "") + text.substring(m+1);
			}
			else
			{
				break;
			}
			n = text.lastIndexOf("${", n+2);
		}
		
		return text;
	},
	
	applyFlt: function() {
		var me = this,
			text = me.title,
			t;
		
		t = me.formatTitle(text);
		
		me.title_disp = t;
		
		me._title(t);
	},
	
	showTitle: function(visible, force) {
		if (typeof(visible) != "undefined")
		{
			var me = this;
			if (force != true)
			{
				me.showtitle = visible;
			}
			
			if (visible != me._v)
			{
				me._v = (me.owner.editmode ? true : visible);
				me.box_title[me._v == false ? "hide" : "show"]();
				me.l2/*resizeH*/();
			}
		}
	},
	
	hide: function() {
		this.box.hide();
	},
	
	show: function() {
		if (this.objtype != "_dc")
			this.box.show();
	},
		
	viewchange: function(enable, isrstat) {
		var me = this;
		me.btnmap["viewgrid"] && me.btnmap["viewgrid"].el[enable ? "show" : "hide"]();
		me.btnmap["viewchart"] && me.btnmap["viewchart"].el[enable ? "show" : "hide"]();
		me.btnmap["viewrstat"] && me.btnmap["viewrstat"].el[enable && isrstat ? "show" : "hide"]();
	},

	setReportOption: function(sop) {
		var me = this,
			sval,
			sheet_toolbar = ig$.sheet_toolbar,
			st,
			stbtn,
			bmode = {},
			i,
			mvval,
			msval, n,
			bmap = [];

		me.btnmap["exp_excel"].el.hide();
		me.btnmap["exp_pdf"].el.hide();
		me.btnmap["exp_csv"].el.hide();
		me.btnmap["jasper_excel"].el.hide();
		me.btnmap["jasper_pdf"].el.hide();
		me.btnmap["jasper_docx"].el.hide();
		me.btnmap["jasper_html"].el.hide();
		me.btnmap["jasper_ppt"].el.hide();
		me.btnmap["jasper_rtf"].el.hide();
		me.btnmap["office_0"].el.hide();
		me.btnmap["office_1"].el.hide();
		me.btnmap["office_2"].el.hide();
		me.btnmap["office_3"].el.hide();
		
		if (sop && sop.tb_prt_i)
		{
			mvval = sop.tb_prt_i.split(";");
			msval = sop.tb_prt_s ? sop.tb_prt_s.split(";") : []; 
			
			for (i=0; i < mvval.length; i++)
			{
				bmode[mvval[i]] = {
					icon: msval[i]
				};
			}
		}
		
		if (sheet_toolbar)
		{
			for (i=0; i < sheet_toolbar.length; i++)
			{
				st = sheet_toolbar[i];
				stbtn = me.btnmap[st.key];
				stbtn && stbtn.el.hide();
				
				bmode[st.key] && me.btnmap[st.key].el.show(); 
			}
		}
		
		if (sop)
		{
			me.viewchange(sop.tb_vch);

			if (sop.tb_prt && sop.tb_prt_i)
			{
				bmap = [
				    {n: "excel", m: "exp_excel"},
				    {n: "pdf", m: "exp_pdf"},
				    {n: "csv", m: "exp_csv"},
				    {n: "jasper_excel", m: "jasper_excel"},
				    {n: "jasper_pdf", m: "jasper_pdf"},
				    {n: "jasper_ppt", m: "jasper_ppt"},
				    {n: "jasper_docx", m: "jasper_docx"},
				    {n: "jasper_rtf", m: "jasper_rtf"},
				    {n: "jasper_html", m: "jasper_html"},
				    {n: "office_0", m: "office_0"},
				    {n: "office_1", m: "office_1"},
				    {n: "office_2", m: "office_2"},
				    {n: "office_3", m: "office_3"}
				];
				
				$.each(bmap, function(i, k) {
					if (bmode[k.n])
					{
						me.btnmap[k.m].el.show();
						
						if (bmode[k.n].icon)
						{
							me.btnmap[k.m].el.addClass(bmode[k.n].icon);
						}
					}
				});
			}
		}
	},
	
	showDropProxy: function() {
		var me = this;
		
		me.owner.sdpx/*showdropproxy*/.call(me.owner, me);
		me.$sizeDropProxy();
	},
	
	hideDropProxy: function() {
		var me = this;
		me.owner.sdph/*hidedropproxy*/.call(me.owner, me);
	},
	
	$sizeDropProxy: function() {
		var me = this,
			body_container = $(me.owner.body_container),
			os = me.box.offset(),
			w = IG$.x_10/*jqueryExtension*/._w(me.box),
			h = IG$.x_10/*jqueryExtension*/._h(me.box),
			drop_proxy = me.drop_proxy;
			
		me.bbox = {
			x: os.left + body_container.scrollLeft(),
			y: os.top + body_container.scrollTop(),
			w: w,
			h: h
		};
		
		IG$.x_10/*jqueryExtension*/._w(drop_proxy, w);
		IG$.x_10/*jqueryExtension*/._h(drop_proxy, h);
	},
	
	setActive: function(active) {
		var me = this,
			titlebox = me.box_title,
			cbox = me.box_container;
		
		if (active == true)
		{
			titlebox.removeClass("doc_title_normal")
					.addClass("doc_title_selected");
					
			cbox.removeClass("doc_normal")
				.addClass("doc_active");
		}
		else
		{
			titlebox.removeClass("doc_title_selected")
				    .addClass("doc_title_normal");
				    
			cbox.removeClass("doc_active")
				.addClass("doc_normal");
		}
	},
	
	_measureContainer: function() {
		var me = this,
			_pc = me._pc,
			mr;
		
		mr = {
			fixed: {
				w: _pc._fw,
				h: _pc._fh
			},
			flex: {
				w: _pc._w,
				h: _pc._h
			},
			m: {
				w: _pc._mw,
				h: _pc._mh
			}
		};
		
		return mr;
	}
};
