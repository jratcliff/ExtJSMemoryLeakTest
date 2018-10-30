Ext.define('overrides.AbstractComponent', {
    override: 'Ext.AbstractComponent',

    /**
     * Override that will reuse any generated ids if they exist
     */
    getAutoId: function () {
        var xtype = this.xtype,
            autoIdReuseCache = Ext.autoIdReuseCache,
            reuseId;

        if (Ext.reuseAutoIds && autoIdReuseCache && autoIdReuseCache[xtype] && autoIdReuseCache[xtype].length > 0) {
            reuseId = autoIdReuseCache[xtype].pop();
            console.log('Reusing auto-id:' + reuseId);
            return reuseId.split('-').pop(); // return the number part, which will be the last item in the array
        } else {
            console.log('NOT reusing auto-id, generating a new one...');
            return this.callParent();
        }
    },

    /**
     * Override that will keep track of auto-generated ids as components
     * are destroyed so that these ids can be reused and thus help reduce
     * a dynamic id memory leak bug in IE.
     */
    destroy: function () {
        var me = this,
            id = me.id,
            idArray = Ext.reuseAutoIds && Ext.isString(id) ? id.split('-') : false,
            len = idArray ? idArray.length : 0,
            autoId = len >= 2 ? idArray.pop() : undefined,
            xtype = len >= 2 ? idArray.join('-') : undefined;

        if (!Ext.autoIdReuseCache) {
            Ext.autoIdReuseCache = {};
        }

        // only save the id if it is in the format of {xtype}-{number}
        if (xtype && Ext.isNumeric(autoId)) {
            console.log('Saving auto-id: ' + id);
            if (!Ext.autoIdReuseCache[xtype]) {
                Ext.autoIdReuseCache[xtype] = [id];
            } else {
                Ext.autoIdReuseCache[xtype].push(id);
            }
        }
        return me.callParent(arguments);
    }
});

Ext.define('Ext4App.Application', {
    name: 'Ext4App',

    extend: 'Ext.app.Application',

    requires: [
        'Ext.view.Table'
    ],

    views: [
        // TODO: add views here
    ],

    controllers: [
        // TODO: add controllers here
    ],

    stores: [
        // TODO: add stores here
    ],

    init: function () {

        Ext.reuseAutoIds = true;

        /**
         * Override of Ext.removeNode method to fix IE memory leak issues caused el and dom
         * properties in the Ext.cache
         */
        Ext.removeNode = Ext.isIE
            ? (function () {
                var d;
                return function (n) {
                    if (n && n.tagName.toUpperCase() != 'BODY') {
                        (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);

                        var cache = Ext.cache,
                            id = n.id;

                        if (cache[id]) {
                            cache[id].el = null;
                            cache[id].dom = null;
                            delete cache[id];
                        }

                        if (n.parentNode) {
                            n.parentNode.removeChild(n);
                        }
                        d = d || document.createElement('div');
                        d.appendChild(n);
                        d.innerHTML = '';
                    }
                };
            }())
            : function (n) {
                if (n && n.parentNode && n.tagName.toUpperCase() != 'BODY') {
                    (Ext.enableNestedListenerRemoval) ? Ext.EventManager.purgeElement(n) : Ext.EventManager.removeAll(n);

                    var cache = Ext.cache,
                        id = n.id;

                    if (cache[id]) {
                        cache[id].el = null;
                        cache[id].dom = null;
                        delete cache[id];
                    }

                    n.parentNode.removeChild(n);
                }
            };
    },

    launch: function () {
        Ext.create('Ext.data.Store', {
            storeId: 'simpsonsStore',
            fields: ['name', 'email', 'phone'],
            data: {
                'items': [
                    { 'name': 'Lisa', "email": "lisa@simpsons.com", "phone": "555-111-1224" },
                    { 'name': 'Bart', "email": "bart@simpsons.com", "phone": "555-222-1234" },
                    { 'name': 'Homer', "email": "home@simpsons.com", "phone": "555-222-1244" },
                    { 'name': 'Marge', "email": "marge@simpsons.com", "phone": "555-222-1254" }
                ]
            },
            proxy: {
                type: 'memory',
                reader: {
                    type: 'json',
                    root: 'items'
                }
            }
        });

        // override Ext.view.Table's rowTpl by removing the 'id'
        if (Ext.Array.contains(location.search.toLowerCase().substring(1).split('&'), 'hiderowids')) {
            Ext.view.Table.override({
                rowTpl: [
                    '{%',
                    'var dataRowCls = values.recordIndex === -1 ? "" : " ' + Ext.baseCSSPrefix + 'grid-data-row";',
                    '%}',
                    // '<tr {[values.rowId ? ("id=\\"" + values.rowId + "\\"") : ""]} ',
                    '<tr ',
                    'data-boundView="{view.id}" ',
                    'data-recordId="{record.internalId}" ',
                    'data-recordIndex="{recordIndex}" ',
                    'class="{[values.itemClasses.join(" ")]} {[values.rowClasses.join(" ")]}{[dataRowCls]}" ',
                    '{rowAttr:attributes} tabIndex="-1" {ariaRowAttr}>',
                    '<tpl for="columns">' +
                    '{%',
                    'parent.view.renderCell(values, parent.record, parent.recordIndex, parent.rowIndex, xindex - 1, out, parent)',
                    '%}',
                    '</tpl>',
                    '</tr>',
                    {
                        priority: 0
                    }
                ],
            });
        }
    }
});
