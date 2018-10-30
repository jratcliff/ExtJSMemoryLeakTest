Ext.define('Ext422App.view.Main', {
    extend: 'Ext.container.Container',
    requires: [
        'Ext.tab.Panel',
        'Ext.layout.container.Border',
        'Ext.grid.Panel',
        'Ext.form.field.Display'
    ],

    xtype: 'app-main',

    layout: {
        type: 'border'
    },

    initComponent: function () {
        this.numIterations = 30000; // the max number of iterations
        this.numToggles = 0;

        this.items = this.getItemsCfg();
        this.callParent(arguments);
    },

    toggle: function () {
        this.removeFromCenterPanel();
        this.addToCenterPanel();

        this.numToggles++;
        var toggle = Ext.getCmp('numToggles');;
        toggle.setValue(this.numToggles);
    },

    removeFromCenterPanel: function () {
        var appMain = Ext.ComponentQuery.query('app-main')[0],
            center = appMain.down('#center');

        center.removeAll(true);
    },

    addToCenterPanel: function () {
        var appMain = Ext.ComponentQuery.query('app-main')[0],
            center = appMain.down('#center');

        // make sure everything is removed
        center.removeAll();

        // now add
        center.add({
            xtype: 'gridpanel',
            title: 'Simpsons',
            store: Ext.data.StoreManager.lookup('simpsonsStore'),
            dockedItems: [{
                xtype: 'toolbar',
                id: 'InternalToolsTabBar:ReturnTabBarLink',
                items: [{
                    text: 'testing'
                }]
            }],
            columns: [
                {
                    header: 'id of row', // done via css in index.html
                    width: 200
                },
                {
                    header: 'Name',
                    dataIndex: 'name',
                    editor: 'textfield'
                },
                {
                    header: 'Email',
                    dataIndex: 'email',
                    editor: 'textfield'
                },
                {
                    header: 'Phone',
                    dataIndex: 'phone',
                    editor: 'textfield'
                }
            ]
        });
    },

    runner: function () {
        this.toggle();
    },

    startTask: function (reuseIds) {

        Ext.reuseAutoIds = reuseIds;

        if (!this.taskRunner) {
            this.taskRunner = new Ext.util.TaskRunner();
            this.task = this.taskRunner.newTask({
                run: this.runner,
                scope: this,
                interval: 50,
                repeat: this.numIterations
            });
        }

        this.task.stop();
        this.task.start();
    },

    stopTask: function () {
        this.task.stop();
    },

    getItemsCfg: function () {
        return [
            {
                region: 'west',
                xtype: 'panel',
                layout: {
                    type: 'vbox',
                    align: 'stretch'
                },
                title: 'west',
                width: 150,
                defaults: {
                    xtype: 'button'
                },
                items: [
                    {
                        xtype: 'displayfield',
                        fieldLabel: 'Iteration #',
                        id: 'numToggles',
                        value: 0
                    },
                    {
                        text: 'Start New Ids',
                        handler: Ext.bind(this.startTask, this, [false])
                    },
                    {
                        text: 'Start Reuse Ids',
                        handler: Ext.bind(this.startTask, this, [true])
                    },
                    {
                        text: 'Stop',
                        handler: Ext.bind(this.stopTask, this, [true])
                    },
                    {
                        text: 'Remove',
                        handler: this.removeFromCenterPanel
                    },
                    {
                        text: 'Add',
                        handler: this.addToCenterPanel
                    }
                ]
            },
            {
                region: 'center',
                itemId: 'center',
                xtype: 'container',
                layout: 'card',
                items: [] // dynamically added
            }
        ];
    }
});