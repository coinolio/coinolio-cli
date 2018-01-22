const debug = require('debug')('coinolio-cli:main');
const blessed = require('blessed');
const contrib = require('blessed-contrib');
const request = require('request-promise');
const moment = require('moment');

const coinolio = {
  fetchSnapshots(opts) {
    debug('Fetching snapshots');
    return request({
      uri: `${opts.url}/api/snapshots`,
      json: true
    });
  },

  dashboard(opts) {
    debug('Initialising dashboard');
    const screen = blessed.screen();

    const grid = new contrib.grid({rows: 12, cols: 12, screen: screen});

    let data = [];

    coinolio.fetchSnapshots(opts)
      .then((res) => {
        data = res;
        const availableTable = grid.set(0, 7, 5, 5, contrib.table,
          {
            keys: true,
            fg: 'green',
            label: 'Available Balances',
            columnSpacing: 1,
            columnWidth: [10, 20, 20]
          }
        );
        availableTable.focus();

        let dataset;
        let totalAssetValues;

        dataset = data.slice(0, 9).reverse();
        totalAssetValues = dataset.map((v) => {
          return v.snapshot.totalAssetValue;
        });
        const assetsValueLine = grid.set(0, 0, 6, 6, contrib.line,
          {
            label: 'Total BTC in assets',
            style:
            {
              line: 'yellow',
              text: 'green',
              baseline: 'black'
            },
            minY: Math.min(...totalAssetValues)
          }
        );

        screen.append(assetsValueLine);

        setTimeout(render, 1000 * 60 * 2);
        render();

        screen.key(['escape', 'q', 'C-c'], function(ch, key) {
          return process.exit(0);
        });

        // fixes https://github.com/yaronn/blessed-contrib/issues/10
        screen.on('resize', function() {
          availableTable.emit('attach');
          assetsValueLine.emit('attach');
        });

        screen.render();

        /**
        *
        */
        function generateAvailableTable() {
          let available = [];
          const snapshot = data[0].snapshot;
          for (let key in snapshot.balances) {
            if (snapshot.balances.hasOwnProperty(key)) {
              let entry = [];
              entry.push(key);
              entry.push(snapshot.balances[key].total || '');
              entry.push(snapshot.balances[key].valueBTC || '');
              available.push(entry);
            }
          }
          availableTable.setData({headers: ['Crypto', 'Amount', 'Value (BTC)'], data: available});
        }

        /**
         * Generate data format for line graph
         */
        function generateAssetValue() {
          const dataset = data.slice(0, 9).reverse();
          const totalAssetValues = dataset.map((v) => {
            return v.snapshot.totalAssetValue;
          });
          const assetValue = {
            title: 'Assets (BTC)',
            style: {line: 'blue'},
            x: dataset.map((v) => {
              return moment(v.created_at).format('HH:mm:ss');
            }),
            y: totalAssetValues
          };
          assetsValueLine.setData([assetValue]);
        }

        /**
         * Render charts
         */
        function render() {
          coinolio.fetchSnapshots(opts)
            .then((res) => {
              data = res;
              generateAvailableTable();
              generateAssetValue();
              screen.render();
            });
        }
      });
  }
};

module.exports = coinolio;
