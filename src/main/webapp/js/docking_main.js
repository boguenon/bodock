IG$.x_10/*jqueryExtension*/ = {
	_w: function(jdom, value) {
		var dom = jdom && jdom.length ? jdom[0] : null,
			r = 0;
		
		if (dom)
		{
			if (typeof(value) == "undefined")
			{
				r = dom.offsetWidth || dom.innerWidth || dom.clientWidth;
				r = isNaN(r) ? 0 : r;
			}
			else
			{
				jdom.width(value);
			}
		}
		
		return r;
	},
	_h: function(jdom, value) {
		var dom = jdom && jdom.length ? jdom[0] : null,
			r = 0;
		
		if (dom)
		{
			if (typeof(value) == "undefined")
			{
				r = dom.offsetHeight || dom.innerHeight || dom.clientHeight;
				r = isNaN(r) ? 0 : r;
			}
			else
			{
				jdom.height(value);
			}
		}
		
		return r;
	}
}

// container code
IG$.boDockZone = function(container, cobj) {
	var me = this,
		pwidth = -1,
		pheight = -1,
		lmask,
		lbody,
		bbox;

	me.items = [];
	me.splitters = [];
	me.editmode = false;
	
	me.cobj = cobj;
	// me.gap = 4;
	
	me.docid = 0;
	me.invalidate = -1;
	me.sizeapplied = 0;
	
	me.el_container = container;
	me._el = {
		dom: container
	};
	
	me.body_container = $("<div class='idv-doc-base'></div>").appendTo(container)
		.css({
			width: IG$.x_10/*jqueryExtension*/._w(container),
			height: IG$.x_10/*jqueryExtension*/._h(container)
		});
	me.box = $("<div class='idv-doc-layouter'></div>").appendTo(me.body_container)
		.css({
			minWidth: IG$.x_10/*jqueryExtension*/._w(container),
			minHeight: IG$.x_10/*jqueryExtension*/._h(container),
			position: "relative"
		});
		
	container.bind("resize", function() {
		var cheight = IG$.x_10/*jqueryExtension*/._h(container),
			cwidth = IG$.x_10/*jqueryExtension*/._w(container);
		
		if (cwidth > 0 && cheight > 0 && (pwidth != cwidth || pheight != cheight))
		{
			me.sizeapplied = 1;
			me.body_container.css({
				width: cwidth,
				height: cheight
			});
			me.box.css({
				minWidth: cwidth,
				minHeight: cheight
			});
			me.cW/*containerWidth*/ = cwidth;
			me.cH/*containerHeight*/ = cheight;
			me.updateDisplay.call(me, true);
		}
		
		pwidth = cwidth;
		pheight = cheight;
	});

	container.css({overflow: "hidden"});
	
	me.init();
	me.draggable = null;
}

IG$.boDockZone.prototype = {
	init: function() {
		var me = this,
			drop_proxy;
		
		drop_proxy= me.drop_proxy = $("<div class='dock-inside-wrap'></div>")
			.css({position: "absolute", top: 0, left: 0})
			.appendTo(me.body_container);
		
		drop_proxy.hide();
		
		me.dockinsg = $("<div class='dock-inside-guide'></div>")
			.css({position: "absolute"})
			.appendTo(me.body_container)
			.hide();
		
		me.bodylist = {};
		
		me._root = {
			type: "mondrian",
			draggable: false,
			objtype: "_dc",
			_direction: 0, // 0 horizontal, 1 vertical
			width: null,
			height: null,
			children: []
		};
		
		me.configDropZone();
	},
	
	configDropZone: function() {
		var me = this,
			el = me.body_container;
		
		el.droppable({
			activate: function(event, ui){
				var botype = ui.draggable.attr("botype");
				
				if (botype == "widget")
				{
					me._accept = {
						is_new: true,
						widget: "Report"
					};
					
					me.showDropProxy.call(me, event, ui, me._accept);
				}
			},
			out : function(event, ui){
				me._accept = null;
			},
			over : function(event, ui){
				var dt,
					ret,
					ui;
				
				if (me._accept)
				{
					ret = true;
					me.dragOver.call(me, event, ui, me._accept);
				}
				return ret;
			},
			drop : function(event, ui){
				if (me._accept)
				{
					me.l18/*dragStop*/.call(me, event, ui, me._accept);
				}
				
				me._accept = null;
				return true;
			}
		});
	},
	
	customLoad: function(visible, mview) {
		if (visible == true)
		{
			var me = this,
				btn,
				dom,
				lm,
				ld,
				i;
			
			me._ldo = me._ldo || [];
			if (mview)
			{
				for (i=0; i < me._ldo.length; i++)
				{
					if (me._ldo[i] == mview)
					{
						return;	
					}
				}
			}
			
			me._ldo.push(mview);
			
			lm = {
				msg: IRm$.r1("B_PROC") + " <button id='m-mec-loader'>" + IRm$.r1("B_PROC_CANCEL") + "</button>"
			};
			
			ld = me._$setLoading(lm);
			
			dom = $(me.rendermask);
			
			btn = $("#m-mec-loader", dom).bind("click", function() {
				$.each(me._ldo, function(i, lview) {
					lview && lview._IP5/*cancelQuery*/ && lview._IP5/*cancelQuery*/.call(lview);
				});
			});
		}
	},
	
	setLoading: function(view) {
		var me = this,
			i,
			bf = 0;
			
		if (me._ldo)
		{
			for (i=me._ldo.length-1; i>=0; i--)
			{
				if (me._ldo[i] == view)
				{
					me._ldo.splice(i, 1);
					bf = 1;
				}
			}
			
			if (me._ldo.length == 0)
			{
				me._$setLoading(false);
			}
		}
	},
	
	_$setLoading: function(load, targetEl) {
		var me = this,
            config = {
                target: me
            };

        if (me._el.dom) {
            me.loadMask && me.loadMask.destroy();
            config.target.rendermask = null;
            me.loadMask = null;

            if (load !== false) {
                if (IG$.isObject(load)) 
                {
                    IG$.apply(config, load);
                } 
                else if (IG$.isString(load)) 
                {
                    config.msg = load;
                }
                
                me.loadMask = new IG$._pbm/*mask*/(config);
                me.loadMask.show();
            }
        }
        return me.loadMask;
	},
	
	processLayoutWidget: function(_pcontainer, isroot, report, ctrls) {
		var me = this,
			ubody,
			sheet,
			iscontainer,
			i, obj;
			
		sheet = ctrls[_pcontainer.docid] || {};
		ubody = me.appendWidgetBox.call(me, _pcontainer.docid,  
			{
				width: (_pcontainer.width ? parseInt(_pcontainer.width) : null), 
				height: (_pcontainer.height ? parseInt(_pcontainer.height) : null),
				title: sheet.name || "",
				close: sheet.close,
				hidetitle: sheet.hidetitle,
				fixed_width: sheet.fixed_width,
				fixed_height: sheet.fixed_height,
				showtab: (sheet.tab_option ? sheet.tab_option.showtab : true),
				draggable: me.draggable
			}, _pcontainer.objtype);
		
		_pcontainer.docid = ubody.docid;
		ubody.objtype = _pcontainer.objtype;
		
    	sheet.objtype = ubody.objtype;
    	sheet.docid = ubody.docid;
    	
    	ctrls[ubody.docid] = sheet;
    	
    	_pcontainer.lt = {
			pos: {
				x: 0,
				y: 0,
				w: 0,
				h: 0
			},
			ubody: ubody
		};
		
		ubody._pc = _pcontainer;
    	
    	ubody.validateProperty.call(ubody);
    	
    	$.each(_pcontainer.children, function(i, d) {
    		me.processLayoutWidget.call(me, d, false, report, ctrls);
    	});
	},
	
	processLayoutView: function(report) {
		var me = this,
			ctrls = me.ctrls,
			hasfilter = [];
		
		me._async = {
			c: 0,
			f: 0,
			bd: []
		};
		
		$.each(me.items, function(i, ubody) {
			ubody._loaded = 0;
			me._async.bd.push(ubody);
			
			switch (ubody.objtype)
			{
			case "FILTER":
				me._async.f ++;
				hasfilter.push(ubody);
				break;
			default:
				me._async.c ++;
				break;
			}
		});
		
		$.each(me.items, function(i, ubody) {
			var view,
				sheet = ctrls[ubody.docid];
			
			ubody.box_container.bind("i_ready", function(e) {
				var m,
					f, afilter;
					
				e.stopPropagation();
				
				if (ubody._loaded)
					return;
					
				ubody._loaded = 1;
				
    			switch (ubody.objtype)
    			{
    			case "FILTER":
    				me._async.f --;
    				break;
    			default:
    				me._async.c --;
    				break;
    			}
    			
    			if (me._async.c == 0 && me._async.f == 0 && me.cmode == 0)
    			{
    				if (hasfilter.length)
    				{
    					if (hasfilter.length == 1)
    					{
    						f = hasfilter[0];
    						f.view && f.view.updateFilterValues.call(f.view, true, true);
    					}
    					else
    					{
    						$.each(hasfilter, function(m, mf) {
    							var v = mf.view,
    								filteroptions,
    								showbutton,
    								f_b_trg,
    								f_b_trg_all;
    								
	    						if (v)
	    						{
	    							filteroptions = v.sheetoption.filter_options;
									showbutton = filteroptions ? filteroptions.showbutton : false;
									f_b_trg = (showbutton && filteroptions.f_b_trg) ? 1 : 0;
									f_b_trg_all = f_b_trg && filteroptions.f_b_trg_all ? 1 : 0;
									
									if (f_b_trg)
									{
										f = mf;
									}
	    						}
	    					});
	    					
    						if (!f)
    						{
    							f = hasfilter[hasfilter.length-1];
    						}
    						
    						f.view && f.view.updateFilterValues.call(f.view, true, true);
	    				}
    				}
    				else
    				{
    					me.cobj.toolbarHandler.call(me.cobj, "cmd_run", null, null, null, 1);
    				}
    			}
    		});
			
			me.createWidgetView.call(me, ubody, report);
		});
		
		// after render
		$.each(me.items, function(i, ubody) {
			if (ubody.objtype == "FILTER")
			{
				ubody.view.init_f.call(ubody.view, true);
			}
		});
	},
	
	createWidgetView: function(ubody, report) {
		var me = this,
			ctrls = me.ctrls,
			view,
			sheet = ctrls[ubody.docid];
		
    	ubody.box_container.trigger("i_ready");
    	
    	if (ubody.objtype)
    	{
    		ubody.box.addClass("igc-" + ubody.objtype.toLowerCase() + "-cnt");
    	}
    	
		if (view)
		{
			view.sheetoption = sheet;
			ubody.view = view;
		}
		
		ubody.setReportOption.call(ubody, sheet);
	},
	
	isContainer: function(objtype) {
		return objtype == "TAB" || objtype == "PANEL" || objtype == "_dc";
	},
	
	getNodeSize: function(node) {
		var i,
			w = 0,
			h = 0,
			c;
		
		for (i=0; i < node.children.length; i++)
		{
			c = node.children[i];
			if (c.width && c.height)
			{
				if (node._direction == 0)
				{
					w += c.width;
					h = Math.max(h, c.height);
				}
				else
				{
					w = Math.max(w, c.width);
					h += c.height;
				}
			}
		}
		
		node.width = w;
		node.height = h;
	},
	
	makeLayout: function(report, root, ctrls) {
		var me = this,
			i,
			layoutitem,
			ubody,
			rootnode;
		
		me._root = root;
		me.ctrls = ctrls;
		
		if (root)
		{
			me.gdoc_id(root);
			me.processLayoutWidget(root, true, report, ctrls);
			me.updateDisplay(false, true);
			me.processLayoutView(report);
		}
	},
	
	gdoc_id: function(p) {
		var me = this;
		
		me.doc_id(p.docid);
		
		if (p.children)
		{
			$.each(p.children, function(i, k) {
				me.gdoc_id(k);
			});
		}
	},
	
	doc_id: function(docid) {
		var me = this,
			id;
		
		if (docid && docid.indexOf("_") > -1)
		{
			id = parseInt(docid.substring(docid.indexOf("_")+1)) + 1;
			me.docid = Math.max(me.docid, id);
		}
	},
	
	showDrop: function(docitem, pos, loc) {
		var me = this,
			ditem = me.docitems[docitem.docid],
			binner = docitem.binner,
			w = IG$.x_10/*jqueryExtension*/._w(binner),
			h = IG$.x_10/*jqueryExtension*/._h(binner),
			drop_proxy = me.drop_proxy,
			i, dw, dh;
		
		me.sdpx/*showdropproxy*/(docitem);
		
		IG$.x_10/*jqueryExtension*/._w(drop_proxy, w);
		IG$.x_10/*jqueryExtension*/._h(drop_proxy, h);
		
		pos.top += me.__mpos ? me.__mpos.top : 0;
		pos.left += me.__mpos ? me.__mpos.left : 0;
		
		me.dockinsg.css(pos);
		me.dockinsg.show();
	},
	
	sdpx/*showdropproxy*/: function(docitem) {
		var me = this,
			drop_proxy = me.drop_proxy,
			dockinsg = me.dockinsg,
			os = docitem.binner.offset(),
			body_container = $(me.body_container),
			mos = body_container.offset();
		
		me.__mpos = {
			top: os.top - mos.top + body_container.scrollTop(),
			left: os.left - mos.left + body_container.scrollLeft()
		};
		
		drop_proxy.css({
			top: me.__mpos.top,
			left: me.__mpos.left,
			zIndex: 120
		});
		drop_proxy.show();
		
		dockinsg.css({
			zIndex: 122
		});
		
		dockinsg.show();
	},
	
	sdph/*hidedropproxy*/: function(docitem) {
		var me = this,
			drop_proxy = me.drop_proxy,
			dockinsg = me.dockinsg;
			
		drop_proxy.hide();
		dockinsg.hide();
	},
	
	titleChangeHandler: function() {
		var me = this;
		$.each(me.items, function(i, ubody) {
			if (ubody.objtype == "TAB")
			{
				ubody.view.validateItems.call(ubody.view);
			}
		});
	},
	
	appendWidgetBox: function(docid, config, objtype) {
		var me = this,
			b, id,
			isnew,
			litem;
			
		if (!docid)
		{
			docid = "dock_" + (me.docid++);
			isnew = true;
		}
		else if (docid.indexOf("_") > -1)
		{
			id = parseInt(docid.substring(docid.indexOf("_")+1)) + 1;
			me.docid = Math.max(me.docid, id);
		}
		
		if (me.bodylist[docid])
		{
			b = me.bodylist[docid];
		}
		else
		{
			if (config)
			{
				config.objtype = config.objtype || objtype;
			}
			b = new IG$.dockingWidget(me, docid, config);
			b.box.appendTo(me.box);
			me.items.push(b);
			
			me.bodylist[docid] = b;
		}
		
		b.box.bind("titlechange", function() {
			me.titleChangeHandler.call(me);
		});
		
		if (!isnew)
		{
			me.updateDisplay.call(me);
		}

		return b;
	},
	
	getBox: function(docid) {
		var me = this,
			i, item,
			items = me.items,
			r = null;
		
		for (i=0; i < items.length; i++)
		{
			if (items[i].docid == docid)
			{
				r = items[i];
				break;
			}
		}
		
		return r;
	},
	
	clearAll: function() {
		var i,
			me = this,
			items = me.items;
		
		for (i=items.length-1; i >= 0; i--)
		{
			items[i].box.remove();
			items.splice(i, 1);
		}
		
		me.bodylist = {};
		me.docitems = {};
		
		me.updateDisplay();
	},
	
	removeWidget: function(docid, skip_event, skip_parent) {
		var me = this,
			i,
			items = me.items, item,
			pnode,
			arr;
			
		for (i=0; i < items.length; i++)
		{
			if (items[i].docid == docid)
			{
				items[i].box.remove();
				items.splice(i, 1);
				break;
			}
		}
		
		item = me.docitems[docid];
		
		if (item && item.children && item.children.length)
		{
			for (i=item.children.length-1; i>=0; i--)
			{
				me.removeWidget(item.children[i].docid, 1, 1);
			}
		}
		
		if (!skip_parent && item && item.parent)
		{
			pnode = item.parent.node;
			arr = item.parent.children;
			for (i=0; i < arr.length; i++)
			{
				if (arr[i].docid == item.docid)
				{
					arr.splice(i, 1);
					break;
				}
			}
			
			if (item.parent.objtype == "_dc" && item.parent.children.length == 0)
			{
				me.removeWidget(item.parent.docid, skip_event);
			}
		}
		
		delete me.bodylist[docid];
		delete me.docitems[docid];
		
		if (!skip_event)
		{
			me.updateDisplay.call(me);
		}
	},
	
	closeWidget: function(docid) {
		var me = this,
			docitems = me.docitems,
			item;
		
		item = docitems[docid];
		
		if (item.container == true && !item.parent)
		{
			return;
		}
		
		IG$.confirmMessages(ig$.appname, "Confirm to delete content?", function(e) {
			if (e == "yes")
			{
				var r = true,
					newparent, i, relative;
				
				if (me._IM6/*closeDockNotify*/)
				{
					r = me._IM6/*closeDockNotify*/.f.call(me._IM6/*closeDockNotify*/.s, docid);
				}
				
				if (r == true)
				{
					me.removeWidget.call(me, docid);
				}
			}
		});
	},
	
	maximizeWidget: function(docid) {
		var me = this,
			r = true,
			bodylist = me.bodylist,
			item, relative;
		
		if (me.maximizeDockNotify)
		{
			r = me.maximizeDockNotify.f.call(me.closeDockNotify.s, docid);
		}
		
		if (r == true)
		{
			item = bodylist[docid];
			item.status = (item.status == "max") ? null : "max";
			item.btnmap["maximize"].el[item.status == "max" ? "addClass" : "removeClass"]("dock_minimize");
			me.updateDisplay.call(me);
		}
	},
	
	configDock: function(docid, cmode) {
		var me = this;
		me.box.trigger(cmode, docid);
	},
	
	setLayout: function(layout) {
		this.processLayout(layout, null);
	},
	
	processLayout: function(items, udoc) {
		if (items && items.length > 0)
		{
			var i,
				panel,
				item;
			for (i=0; i < items.length; i++)
			{
				item = items[i];
				item.draggable = this.draggable;
				panel = this.appendWidgetBox(item.docid || null, item, item.objtype);
				panel.objtype = item.objtype;
				if (item.items)
				{
					this.processLayout(item.items, panel);
				}
			}
		}
	},
	
	getLayout: function() {
		var me = this,
			root = me._root,
			layout,
			dobj;
		
		layout = {
			type: "mondrian",
			children: []
		};
		
		layout.children = me.$doLayout(root, null);
		
		return layout;
	},
	
	$doLayout: function(item, pitem) {
		var me = this,
			children = [],
			r;
		
		r = {
			docid: item.docid,
			objtype: item.objtype,
			width: item.width,
			height: item.height,
			// _direction: typeof(item._direction) == "undefined" ? 0 : null,
			r: pitem ? pitem.docid : null,
			p: null,
			d: item._direction
		}
			
		children.push(r);
		
		if (item.children)
		{
			r.children = [];
			
			$.each(item.children, function(i, citem) {
				var k,
					sitems;
				
				sitems = me.$doLayout.call(me, citem, item);
				
				for (k=0; k < sitems.length; k++)
				{
					r.children.push(sitems[k]);
				}
			});
		}
		
		return children;
	},
	
	setActive: function(selitem) {
		var me = this,
			items = me.items,
			item,
			i;
		
		for (i=0; i < items.length; i++)
		{
			item = items[i];
			item.setActive.call(item, (selitem == item));
		}
		
		me.box.trigger("activechanged", selitem);
	},
	
	clearSplitters: function() {
		var me = this,
			splitters = me.splitters,
			splitter,
			i;
			
		for (i=splitters.length - 1; i>=0; i--) {
			splitter = splitters[i];
			splitter.l5/*remove*/();
			if (splitter.panel)
			{
				splitter.panel._SP = [];
			}
		}
		
		splitters = [];
	},

	updateDisplay: function(b_resized, b_force) {
		var me = this;
		
		if (me.invalidate > -1)
		{
			clearTimeout(me.invalidate);
		}

		if (b_force == true)
		{
			me.validateNow.call(me);
			if (!b_resized)
			{
				me.box.trigger("updatecomplete");
			}
			else
			{
				me.updateScale.call(me);
			}
		}
		else
		{
			me.invalidate = setTimeout(function() {
				me.validateNow.call(me);
				if (!b_resized)
				{
					me.box.trigger("updatecomplete");
				}
				else
				{
					me.updateScale.call(me);
				}
			}, 50);
		}
	},
	
	validateNow: function() {
		var me = this,
			i,
			w = IG$.x_10/*jqueryExtension*/._w(me.body_container)-2,
			h = IG$.x_10/*jqueryExtension*/._h(me.body_container)-2,
			item,
			haserror = false,
			hasmax = null,
			visible,
			node,
			dv,
			k,
			r,
			sheight = 20,
			mw, mh,
			ubody,
			rect,
			b1;
			
		me.clearSplitters();
			
		if (me._root && me._root.lt && w > 0 && h > 0)
		{
			item = me._root;
			ubody = item.lt.ubody;
			item.lt.pos.x = 0; item.lt.pos.y = 0; item.lt.pos.w = w; item.lt.pos.h = h;
			
			me._updateNodeSize(me._root);
			
			me.docitems = {};
			r = ubody._measureContainer.call(ubody);
			
			mw = r.fixed.w;
			mh = r.fixed.h;
			
			w = Math.max(mw, w, r.m.w);
			h = Math.max(mh, h, r.m.h);
			
			if (mw > me.cW/*containerWidth*/ && mh < me.cH/*containerHeight*/)
			{
				h -= sheight;
			}
			else if (mh > me.cH/*containerHeight*/ && mw < me.cW/*containerWidth*/)
			{
				w -= sheight;
			}
			else if (mh > me.cH/*containerHeight*/ && mw > me.cW/*containerWidth*/)
			{
				w -= sheight;
				h -= sheight;
			}
			
			rect = {
				x: 0,
				y: 0,
				w: w,
				h: h
			};
			
			me.updateLayout(item, 0, 0, w, h, 0, r, rect, false);
			
			for (k in me.bodylist)
			{
				if (me.bodylist[k].status == "max" && me.bodylist[k].visible != false)
				{
					hasmax = k;
					break;
				}
			}
			
			for (k in me.docitems)
			{
				node = me.docitems[k];
				visible = me.bodylist[k].visible;
				visible = (visible != false && me.bodylist[k].hidden == true) ? false : visible;
				
				b1 = node.lt.ubody.box;
				node.visible = ((!hasmax && visible != false) || k == hasmax);
				// node.lt.ubody.visible = node.visible;
				
				if (node.visible && node.objtype != "_dc")
				{
					b1.show();
					b1.trigger("resize");
				}
				else
				{
					b1.hide();
				}
			}
			
			if (!hasmax)
			{
				me.validateSplitter();
			}
		}
	},
	
	updateScale: function() {
		var me = this,
			i,
			item,
			dv,
			css = {
				overflowX: "hidden",
				overflowY: "hidden"
			},
			oset,
			box = me.box,
			boff = box.offset(),
			w, h, wmax = 0, hmax = 0, k,
			bpos;
		
		for (k in me.docitems)
		{
			item = me.docitems[k];
			if (item && item.lt && item.lt.ubody)
			{
				bpos = item.lt.pos;
				
				oset = {
					top: Math.round(bpos.y),
					left: Math.round(bpos.x)
				};
				
				w = Math.round(bpos.w);
				h = Math.round(bpos.h);
				
				wmax = Math.max(wmax, w + oset.left); // - boff.left);
				hmax = Math.max(hmax, h + oset.top); //  - boff.top);
				item.lt.ubody.width = w;
				item.lt.ubody.height = h;
				item.width = w;
				item.height = h;
			}
		}

		
		if (wmax > 0 && hmax > 0)
		{
			me.sizeapplied = 1;
			
			IG$.x_10/*jqueryExtension*/._w(box, wmax);
			IG$.x_10/*jqueryExtension*/._h(box, hmax);
			
			if (wmax > me.cW/*containerWidth*/)
			{
				css.overflowX = "auto";
			}
			if (hmax > me.cH/*containerHeight*/)
			{
				css.overflowY = "auto";
			}
			me.body_container.css(css).animate({
				scrollTop: 0,
				scrollLeft: 0
			});
			
			me.box.trigger("boxresized");
		}
	},
	
	showTabButton: function(mview, visible) {
		var me = this;
		
		if (mview.view && mview.view.tabarea)
		{
			mview.view.editmode = me.editmode;
			mview.view.tabarea[visible ? "show" : "hide"]();
		}
	},
	
	updateLayout: function(item, xx, yy, tw, th, seq, nbr, rect, _pitem) {
		var me = this,
			mbody = item.lt.ubody,
			sw, sh,
			pw, ph,
			sp = {
				top: false,
				left: false,
				right: false,
				bottom: false
			},
			fixed_width, fixed_height,
			m = {
				fixedw: 0,
				fixedh: 0,
				flexw: 0,
				flexh: 0
			},
			titleh = 0,
			istabview = (mbody.objtype == "TAB") ? true : false,
			ispanel = (mbody.objtype == "PANEL") ? true : false,
			bmax = mbody.status == "max",
			showtab = (istabview == true && mbody.view && mbody.view.sheetoption && 
				mbody.view.sheetoption.tab_option && 
				mbody.view.sheetoption.tab_option.showtab == false) ? false : true,
			tabheight = 0,
			ishidden = mbody.hidden,
			iscontainer = (istabview || ispanel),
			b1, bpos,
			mshow = me.editmode ? "show" : "hide",
			btnmap = mbody.btnmap,
			pos,
			r, tg,
			__pp, __gpp,
			_mp;
						
		__pp = item.parent;
		
		while (__pp && !ishidden)
		{
			if (__pp.hidden)
			{
				ishidden = 1;
				break
			}
			else if (__pp.visible == false)
			{
				ishidden = 1;
				break;
			}
			
			__gpp = __pp.parent;
			
			if (__gpp && __gpp.objtype == "TAB")
			{
				if (__gpp.active != __pp.docid)
				{
					ishidden = 1;
					break;
				}
			}
			
			__pp = __pp.parent;
		}
		
		if (me.bodylist[mbody.docid] && me.bodylist[mbody.docid].view)
		{
			me.bodylist[mbody.docid].view._editmode = me.editmode;
		}
		
		if (me.editmode)
		{
			mbody.showTitle.call(mbody, true, true);
			
			if (istabview)
			{
				me.showTabButton(mbody, true);
			}
			
			if (_pitem && _pitem.objtype == "TAB")
			{
				tabheight = 24;
			}
		}
		else
		{
			mbody.showTitle.call(mbody, mbody.showtitle, true);
			
			if (istabview && showtab)
			{
				me.showTabButton(mbody, true);
			}
			else if (istabview)
			{
				me.showTabButton(mbody, false);
			}
			
			if (_pitem && _pitem.objtype == "TAB")
			{
				if (_pitem.lt && _pitem.lt.ubody && _pitem.lt.ubody.view &&
					_pitem.lt.ubody.view.sheetoption && _pitem.lt.ubody.view.sheetoption.tab_option &&
					_pitem.lt.ubody.view.sheetoption.tab_option.showtab)
				{
					tabheight = 24;
				}
			}
		}
		
		if (mbody._v && mbody.objtype != "_dc")
		{
			titleh = IG$.x_10/*jqueryExtension*/._h(mbody.box_title);
		}
		
		item.__titleh = titleh;
				
		me.docitems[item.docid] = item;
		
		fixed_width = item.fixed_width; // (ptp == "top" || ptp == "bottom") ? false : mbody.fw;
		fixed_height = item.fixed_height; // (ptp == "left" || ptp == "right") ? false : mbody.fh;
		
		m.fixedw = nbr.fixed.w; // nbr.fixed.inner.w + nbr.fixed.left.w + nbr.fixed.right.w;
		m.fixedh = nbr.fixed.h; // nbr.fixed.inner.h + nbr.fixed.top.h + nbr.fixed.bottom.h;
		
		m.flexw = nbr.flex.w; // nbr.flex.inner.w + nbr.flex.left.w + nbr.flex.right.w;
		m.flexh = nbr.flex.h; // nbr.flex.inner.h + nbr.flex.top.h + nbr.flex.bottom.h;
		
	
		sw = m.flexw;
		sh = m.flexh;
		pw = m.fixedw;
		ph = m.fixedh;
		
		pos = item.lt.pos;
		
		if (!_pitem)
		{
			pos.x = xx;
			pos.y = yy;
			pos.w = tw;
			pos.h = th;
		}
		else if (_pitem && (_pitem.objtype == "PANEL" || _pitem.objtype == "TAB"))
		{
			tg = 0;
			
			if (_pitem.__titleh && (_pitem.objtype == "PANEL" || _pitem.objtype == "TAB") && (_pitem.lt.ubody._v || me.editmode))
			{
				tg = _pitem.__titleh;
			}
			
			pos.x = xx;
			pos.y = yy + tg + tabheight;
			pos.w = tw;
			pos.h = th - (tg + tabheight);
		}
		else if (_pitem && _pitem.objtype == "_dc")
		{
			
			pos.x = xx + (_pitem._direction == 0 ? _pitem._g : 0);
			pos.y = yy + (_pitem._direction == 1 ? _pitem._g : 0);
			
			if (_pitem._direction == 1)
			{
				pos.w = tw;
			}
			else if (fixed_width)
			{
				pos.w = (item._fw > tw - _pitem._g ? tw - _pitem._g : item._fw);
			}
			else
			{
				pos.w = item._w * (tw - nbr.fixed.w) / nbr.flex.w;
			}
			
			if (_pitem._direction == 0)
			{
				pos.h = th;
			}
			else if (fixed_height)
			{
				pos.h = (item._fh > th - _pitem._g ? th - _pitem._g : item._fh);
			}
			else
			{
				pos.h = item._h * (th - nbr.fixed.h) / nbr.flex.h;
			}
		}
		
		r = mbody._measureContainer.call(mbody);
		
		pos.w = r.m.w > pos.w ? r.m.w : pos.w;
		pos.h = r.m.h > pos.h ? r.m.h : pos.h;
		
		mbody.lt = {
			x: pos.x,
			y: pos.y,
			w: pos.w,
			h: pos.h
		};
		
		item._g = 0;
		
		$.each(item.children, function(i, tp) {
			var s = mbody.lt,
				ubody = tp.lt.ubody;
			
			me.updateLayout.call(me, tp, s.x, s.y, s.w, s.h, i, r, rect, item);
			item._g += item._direction == 0 ? tp.lt.pos.w : tp.lt.pos.h;
			
			if (i > 0)
			{
				var splitter = new IG$.sp/*docksplit*/({
					docmain: me,
					mondrian: true,
					panel: tp,
					direction: item._direction ? "horizontal" : "vertical"
				});
				me.splitters.push(splitter);
			}
		});
		
		b1 = mbody.box;
		
		b1.removeClass("ic-top");
		b1.removeClass("ic-left");
		b1.removeClass("ic-right");
		b1.removeClass("ic-bottom");
		
		iscontainer = me.isContainer(mbody.objtype);
			
		if (!bmax)
		{
			pos.x == 0 && b1.addClass("ic-left");
			pos.y == 0 && b1.addClass("ic-top");
			pos.x + pos.w > rect.w - 10 && b1.addClass("ic-right");
			pos.y + pos.h > rect.h - 10 && b1.addClass("ic-bottom");
		}
		
		_mp = {
			left: (bmax ? rect.x : pos.x),
			top: (bmax ? rect.y : pos.y),
			width: (bmax ? rect.w : pos.w),
			height: (bmax ? rect.h : pos.h),
			zIndex: (mbody.objtype == "_dc" ? 0 : (iscontainer ? 1 : 2))
		};
		
		if (mbody._invalidate || !b1.__ps || (b1.__ps && (b1.__ps.top != _mp.top || b1.__ps.left != _mp.left || b1.__ps.width != _mp.width || b1.__ps.height != _mp.height)))
		{
			mbody._invalidate = 0;
			
			b1.css(_mp);
			
			if (mbody.objtype == "_dc" || ishidden)
			{
				b1.hide();
			}
			else
			{
				b1.show();
				// mbody.box.trigger("resize");
			}
			
			b1.__ps = _mp;
			b1._invl = 1;
		}
	},
	
	validateSplitter: function() {
		var me = this,
			splitters = me.splitters,
			splitter,
			i;
			
		for (i=0; i < splitters.length; i++)
		{
			splitter = splitters[i];
			splitter.validate.call(splitter);
			splitter.spui.css("zIndex", 3); //me.sindex++);
			
			splitter.setV(splitter.panel && splitter.panel.visible != false);
		}
	},

	// drag drop support
	showDropProxy: function(event, ui) {
		var me = this,
			w = IG$.x_10/*jqueryExtension*/._w(me.box),
			h = IG$.x_10/*jqueryExtension*/._h(me.box),
			proxy = me.drop_proxy,
			i,
			item;
		
		// add drop proxy for panel drop
		
		for (i=0; i < me.items.length; i++)
		{
			item = me.items[i];
			item.showDropProxy.call(item);
		}
	},
	
	hideDropProxy: function() {
		var i,
			me = this,
			item;
		
		if (me.drop_proxy)
		{
			me.drop_proxy.hide();
		}
		
		if (me.dockinsg)
		{
			me.dockinsg.hide();
		}
		
		for (i=0; i < me.items.length; i++)
		{
			item = me.items[i];
			item.hideDropProxy.call(item);
		}
	},
	
	dragOver: function(event, ui, dragitem) {
		var me = this,
			pt = {
				x: event.pageX,
				y: event.pageY
			},
			loc,
			i,
			dnode,
			cnode,
			dragui,
			subhit,
			item,
			body_container = $(me.body_container),
			gap = {
				top: body_container.scrollTop(),
				left: body_container.scrollLeft()
			};
		
		if (dragitem)
		{
			dragui = dragitem;
		}
		else
		{
			for (i=0; i < me.items.length; i++)
			{
				item = me.items[i];
				item.dropOut.call(item);
				
				if (item.dragging == true)
				{
					dragui = item;
				}
			}
		}
			
		for (i=0; i < me.items.length; i++)
		{
			item = me.items[i];
			loc = item.dropHit(pt, true, null, gap);
			if (loc && loc != "none" && item.dragging == false)
			{
				dnode = me.docitems[item.docid];
				cnode = dnode.parent;
				
				while (cnode)
				{
					if (cnode.loc == "inner" && cnode.docid == dragui.docid)
					{
						loc = "none";
						break;
					}
					cnode = cnode.parent;
				}
				
				if (loc == "_panel_")
				{
					if (dnode)
					{
						subhit = me.C/*getSubHit*/(dnode, pt, 0);
						
						if (subhit && subhit.dhit && subhit.dhit != "none")
						{
							if (dragui.docid != subhit.ditem.docid)
							{
								subhit.ditem.dropIn.call(subhit.ditem, subhit.dhit);
							}
							break;
						}
					}
				}
				else if (loc != "none")
				{
					if (dragui.docid != item.docid)
					{
						item.dropIn.call(item, loc);
					}
					break;
				}
			}
		}
	},
	
	C/*getSubHit*/: function(ditem, pt, seq) {
		var i, j,
			dobj,
			dhit,
			me = this,
			r = {
				dhit: null,
				ditem: null
			},
			citem,
			body_container = $(me.body_container),
			gap = {
				top: body_container.scrollTop(),
				left: body_container.scrollLeft()
			};
		
		if (!ditem.children)
		{
			return r;
		}
		
		for (i=0; i < ditem.children.length; i++)
		{
			citem = ditem.children[i];
			if (citem.objtype == "_dc")
			{
				r = me.C/*getSubHit*/(citem, pt, 1);
			}
			else
			{
				dobj = citem.lt.ubody;
				dhit = dobj.dropHit.call(dobj, pt, true, true, gap);
				
				if (dhit && dhit != "none" && dhit != "_panel_")
				{
					r.dhit = dhit;
					r.ditem = dobj;
					break;
				}
				else 
				{
					r = me.C/*getSubHit*/(citem, pt, 1);
				}
			}
						
			if (r.dhit)
			{
				break;
			}
		}
		
		return r;
	},
	
	l18/*dragStop*/: function(event, ui, dragitem) {
		var me = this,
			pt = {
				x: event.pageX,
				y: event.pageY
			},
			i,
			item,
			dhit,
			dragui,
			cindex,
			cnode,
			dnode,
			arr, barr,
			isparent, bs,
			subhit,
			iscontainer = false,
			body_container = $(me.body_container),
			gap = {
				top: body_container.scrollTop(),
				left: body_container.scrollLeft()
			}, __iserror = 0,
			_pnode, _pproc,
			_d, is_before = 0, _nc, _nc2, seq, cpp;
		
		if (dragitem)
		{
			dragui = dragitem;
		}
		else
		{
			for (i=0; i < me.items.length; i++)
			{
				if (me.items[i].dragging == true)
				{
					dragui = me.items[i];
					cindex = i;
					break;
				}
			}
		}
		
		if (dragui)
		{
			dragui._invalidate = 1;
		}
		
		for (i=0; i < me.items.length; i++)
		{
			dhit = me.items[i].dropHit(pt, true, null, gap);
			if (dhit && dhit != "none" && me.items[i].dragging == false)
			{
				if (dhit == "_panel_")
				{
					dnode = me.docitems[me.items[i].docid];
					
					if (dnode)
					{
						subhit = me.C/*getSubHit*/(dnode, pt, 0);
						
						if (subhit && subhit.dhit && subhit.dhit != "none")
						{
							dhit = subhit.dhit;
							item = subhit.ditem;
							break;
						}
					}
				}
				else
				{
					item = me.items[i];
					break;
				}
			}
		}
			
		me.hideDropProxy();
		
		if (dragui.is_new == true)
		{
			var _root = me._root;
			_root.children = _root.children || [];
			
			_nc = {
				objtype: dragui.widget,
				docid: null,
				_direction: 0,
				parent: _root,
				width: 100,
				height: 100
			};
			
			_root.children.push(_nc);
			
			ubody = me.appendWidgetBox.call(me, null, {
				width: (_nc.width ? parseInt(_nc.width) : null), 
				height: (_nc.height ? parseInt(_nc.height) : null),
				draggable: me.draggable
			}, dragui.widget);
			
			_nc.docid = ubody.docid;
			ubody.objtype = _nc.objtype;
			
			_nc.lt = {
				pos: {
					x: 0,
					y: 0,
					w: 0,
					h: 0
				},
				ubody: ubody
			};
			
			ubody._pc = _nc;
			
			ubody.validateProperty.call(ubody);
			
			dragui = ubody;
			
			me.docitems[dragui.docid] = _nc;
		}
		
		if (item && dhit != "none")
		{
			cnode = me.docitems[item.docid];
			dnode = me.docitems[dragui.docid];
			
			switch (dhit)
			{
			case "top":
			case "bottom":
				_d = 1;
				break;
			case "left":
			case "right":
				_d = 0;
				break;
			}
			
			if (dnode.objtype == "TAB" || dnode.objtype == "PANEL")
			{
				_pnode = cnode.parent;
				
				while (_pnode)
				{
					if (_pnode.docid == dnode.docid)
					{
						me.updateDisplay();
						return;
					}
					
					_pnode = _pnode.parent;
				}
			}
			
			if (dhit == "top" || dhit == "left")
			{
				is_before = 1;
			}
			
			if (dhit == "inner")
			{
				for (i=0; i < dnode.parent.children.length; i++)
				{
					if (dnode.parent.children[i] == dnode)
					{
						dnode.parent.children.splice(i, 1);
						break;
					}
				}
				
				if (cnode.objtype == "PANEL")
				{
					if (cnode.children.length == 0)
					{
						_nc = {
							objtype: "_dc",
							docid: null,
							iscontainer: true,
							_direction: 0,
							children: [],
							width: 0,
							height: 0,
							parent: cnode
						};
						
						me.processLayoutWidget(_nc, true, null, me.ctrls);
						
						cnode.children.push(_nc);
					}
					else
					{
						_nc = cnode.children[0];
					}
					
					dnode.parent = _nc;
					_nc.children.push(dnode);
				}
				else if (cnode.objtype == "TAB")
				{
					dnode.parent = cnode;
					cnode.children.push(dnode);
				}
			}
			else if (cnode.parent.objtype == "TAB")
			{
				_nc = {
					objtype: "PANEL",
					docid: null,
					iscontainer: true,
					_direction: 0,
					children: [],
					width: 0,
					height: 0,
					parent: cnode.parent
				};
				
				me.processLayoutWidget(_nc, true, null, me.ctrls);
				
				me.createWidgetView(_nc.lt.ubody, null);
				
				for (i=0; i < cnode.parent.children.length; i++)
				{
					if (cnode.parent.children[i] == cnode)
					{
						cnode.parent.children.splice(i, 1, _nc);
						break;
					}
				}
				
				_nc2 = {
					objtype: "_dc",
					docid: null,
					iscontainer: true,
					_direction: _d,
					children: [],
					width: 0,
					height: 0,
					parent: _nc
				};
				
				me.processLayoutWidget(_nc2, true, null, null);
				
				_nc.children.push(_nc2);
				
				for (i=0; i < dnode.parent.children.length; i++)
				{
					if (dnode.parent.children[i] == dnode)
					{
						dnode.parent.children.splice(i, 1);
						break;
					}
				}
				
				if (dnode.parent.children.length == 0)
				{
					me.removeWidget(dnode.parent.docid, 1);
				}
				
				cnode.parent = _nc2;
				dnode.parent = _nc2;
				
				if (is_before)
				{
					_nc2.children.push(dnode);
					_nc2.children.push(cnode);
				}
				else
				{
					_nc2.children.push(cnode);
					_nc2.children.push(dnode);
				}
			}
			else if (cnode.parent._direction == _d)
			{
				for (i=0; i < dnode.parent.children.length; i++)
				{
					if (dnode.parent.children[i] == dnode)
					{
						dnode.parent.children.splice(i, 1);
						break;
					}
				}
				
				for (i=0; i < cnode.parent.children.length; i++)
				{
					if (cnode.parent.children[i] == cnode)
					{
						cnode.parent.children.splice((is_before ? i : i+1), 0, dnode);
						break;
					}
				}
				
				if (dnode.parent.objtype != "TAB" && dnode.parent.children.length == 0)
				{
					me.removeWidget(dnode.parent.docid, 1);
				}
				
				dnode.parent = cnode.parent;
			}
			else
			{
				_nc = {
					objtype: "_dc",
					docid: null,
					iscontainer: true,
					_direction: _d,
					children: [],
					width: 0,
					height: 0,
					parent: cnode.parent
				};
				
				me.processLayoutWidget(_nc, true, null, me.ctrls);
				
				for (i=0; i < dnode.parent.children.length; i++)
				{
					if (dnode.parent.children[i] == dnode)
					{
						dnode.parent.children.splice(i, 1);
						break;
					}
				}
				
				cpp = cnode.parent;
				
				for (i=0; i < cpp.children.length; i++)
				{
					if (cpp.children[i] == cnode)
					{
						cpp.children.splice(i, 1, _nc);
						break;
					}
				}
				
				if (dnode.parent.objtype != "TAB" && dnode.parent.children.length == 0)
				{
					me.removeWidget(dnode.parent.docid, 1);
				}
				
				cnode.parent = _nc;
				dnode.parent = _nc;
				
				if (_d == 0)
				{
					dnode.lt.ubody.width = cnode.lt.ubody.width;
				}
				else
				{
					dnode.lt.ubody.height = cnode.lt.ubody.height;
				}
				
				if (is_before)
				{
					_nc.children.push(dnode);
					_nc.children.push(cnode);
				}
				else
				{
					_nc.children.push(cnode);
					_nc.children.push(dnode);
				}
			}
		}
		
		this.updateDisplay();
	},
	
	resizeContainer: function(items) {
		var me = this;
		
		$.each(items, function(i, k) {
			me.changeContainer.call(me, k, k.lt.pos.w, k.lt.pos.h);
		});
	},
	
	changeContainer: function(item, w, h) {
		var me = this,
			i,
			objtype = item.objtype,
			children = item.children,
			sobj,
			tw = 0, th = 0, fw = 0, fh = 0, lw, lh;
			
		me.setSize(item, w, h);
		
		if (objtype == "_dc")
		{
			for (i=0; i < children.length; i++)
			{
				sobj = children[i];
				if (item._direction) // vertical
				{
					tw = w;
					
					if (sobj.fixed_height)
					{
						fh += sobj.lt.pos.h;
					}
					else
					{
						th += sobj.lt.pos.h;
					}
				}
				else // horizontal
				{
					if (sobj.fixed_width)
					{
						fw += sobj.lt.pos.w;
					}
					else
					{
						tw += sobj.lt.pos.w;
					}
					
					th = h;
				}
			}
			
			for (i=0; i < children.length; i++)
			{
				sobj = children[i];
				lw = 0;
				lh = 0;
				
				if (item._direction)
				{
					lw = tw;
					if (sobj.fh)
					{
						lh = sobj._fh;
					}
					else if (h && th && sobj.lt.pos.h)
					{
						lh = (sobj.lt.pos.h / th) * (h - fh);
					}
				}
				else
				{
					if (sobj.fixed_width)
					{
						lw = sobj._fw;
					}
					else if (w && tw && sobj.lt.pos.w)
					{
						// lw = w > 0 && tw > 0 ? (children[i].lt.pos.w / tw) * w : 0;
						lw = (sobj.lt.pos.w / tw) * (w - fw);
						
					}
					
					lh = th;
				}
				me.changeContainer(children[i], w > 0 ? lw : 0, h > 0 ? lh : 0);
			}
		}
		else if (objtype == "PANEL")
		{
			if (children && children.length)
			{
				for (i=0; i < children.length; i++)
				{
					me.changeContainer(children[i], w, h);
				}
			}
		}
		else if (objtype == "TAB")
		{
			if (children && children.length)
			{
				for (i=0; i < children.length; i++)
				{
					me.changeContainer(children[i], w, h);
				}
			}
		}
	},
	
	setSize: function(item, w, h) {
		if ( w > 0)
		{
			item.lt.pos.w = w;
			item.lt.ubody.width = w;
		}
		
		if (h > 0)
		{
			item.lt.pos.h = h;
			item.lt.ubody.height = h;
		}
	},
	
	_updateNodeSize: function(_nc) {
		var me = this,
			i,
			_d,
			ubody = _nc.lt.ubody,
			fw, fh,
			sobj,
			sbody, sfw, sfh;
		
		_nc._w = 0;
		_nc._h = 0;
		_nc._fw = 0;
		_nc._fh = 0;
		_nc._mw = 0;
		_nc._mh = 0;
		
		fw = ubody.fixed_width;
		fh = ubody.fixed_height;
		
		_nc.fixed_width = fw;
		_nc.fixed_height = fh;
					
		if (_nc.objtype == "_dc")
		{
			_d = _nc._direction;
			
			for (i=0; i < _nc.children.length; i++)
			{
				sobj = _nc.children[i];
				sbody = sobj.lt.ubody;
				
				me._updateNodeSize(sobj);
								
				if (_d == 0)
				{
					if (sobj.fixed_height)
					{
						_nc._fh = Math.max(sobj._fh, _nc._fh);
					}
					
					if (sobj.fixed_width && _nc._fw > -1)
					{
						_nc._fw += sobj._fw;
					}
					else
					{
						_nc._fw = -1;
					}
				}
				else if (_d == 1)
				{
					if (sobj.fixed_width)
					{
						_nc._fw = Math.max(sobj._fw, _nc._fw);
					}
					
					if (sobj.fixed_height && _nc._fh > -1)
					{
						_nc._fh += sobj._fh;
					}
					else
					{
						_nc._fh = -1;
					}
				}
			}
			
			if (_nc._fw > 0 || _nc._fh > 0)
			{
				me.changeContainer(_nc, _d == 1 && _nc._fw > 0 ? _nc._fw : 0, _d == 0 && _nc._ff > 0 ? _nc._fh : 0);
				
				_nc.fixed_width = _nc._fw > 0;
				_nc.fixed_height = _nc._fh > 0;
			}
			
			_nc._fw = 0;
			_nc._fh = 0;
			
			for (i=0; i < _nc.children.length; i++)
			{
				sobj = _nc.children[i];
				sbody = sobj.lt.ubody;
				
				me._updateNodeSize(sobj);
								
				if (_d == 0)
				{
					if (sobj.fixed_height)
					{
						_nc._fh = Math.max(sobj._fh, _nc._fh);
						
					}
					else if (!_nc.fixed_height)
					{
						_nc._h = Math.max(sobj._h, _nc._h, sobj._fh);
					}
					
					_nc._mh = Math.max(30, _nc._mh, sobj._mh, sobj._fh);
					
					if (sobj.fixed_width)
					{
						_nc._fw += sobj._fw;
						_nc._mw += sobj._mw;
					}
					else
					{
						_nc._w += sobj._w;
						_nc._mw += 30;
					}
				}
				else if (_d == 1)
				{
					if (sobj.fixed_width)
					{
						_nc._fw = Math.max(sobj._fw, _nc._fw);
					}
					else if (!_nc.fixed_width)
					{
						_nc._w = Math.max(sobj._w, _nc._w, sobj._fw);
					}
					
					_nc._mw = Math.max(30, _nc._mw, sobj._mw, sobj._fw);
					
					if (sobj.fixed_height)
					{
						_nc._fh += sobj._fh;
						_nc._mh += sobj._mh;
					}
					else
					{
						_nc._h += sobj._h;
						_nc._mh += 30;
					}
				}
			}
		}
		else if (_nc.objtype == "PANEL" || _nc.objtype == "TAB")
		{
			_nc.children = _nc.children || [];
			
			ubody.width = ubody.width > 0 ? ubody.width : 30;
			ubody.height = ubody.height > 0 ? ubody.height : 30;
			
			for (i=0; i < _nc.children.length; i++)
			{
				sobj = _nc.children[i];
				me._updateNodeSize(sobj);
				
				if (_nc.objtype == "TAB")
				{
					_nc._fw = Math.max(sobj._fw, _nc._fw);
					_nc._fh = Math.max(sobj._fh, _nc._fh);
					_nc._w = Math.max(sobj._w, _nc._w);
					_nc._h = Math.max(sobj._h, _nc._h);
				}
				else
				{
					_nc._fw += sobj._fw;
					_nc._fh += sobj._fh;
					_nc._w += sobj._w;
					_nc._h += sobj._h;
				}
			}
			
			if (fw)
			{
				_nc._fw = ubody.width;
				_nc._mw = _nc._fw;
			}
			else
			{
				_nc._w = ubody.width;
				_nc._mw = 30;
			}
			
			if (fh)
			{
				_nc._fh = ubody.height;
				_nc._mh = _nc._fh;
			}
			else
			{
				_nc._h = ubody.height;
				_nc._mh = 30;
			}
		}
		else
		{
			ubody.width = ubody.width > 0 ? ubody.width : 30;
			ubody.height = ubody.height > 0 ? ubody.height : 30;
				
			if (fw)
			{
				_nc._fw = ubody.width;
				_nc._mw = _nc._fw;
			}
			else
			{
				_nc._w = ubody.width;
				_nc._mw = 30;
			}
			
			if (fh)
			{
				_nc._fh = ubody.height;
				_nc._mh = _nc._fh;
			}
			else
			{
				_nc._h = ubody.height;
				_nc._mh = 30;
			}
		}
	}
};