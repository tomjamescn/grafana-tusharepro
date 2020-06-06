'use strict';

System.register(['lodash'], function (_export, _context) {
  "use strict";

  var _, _createClass, GenericDatasource;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  return {
    setters: [function (_lodash) {
      _ = _lodash.default;
    }],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      if (!String.prototype.splice) {
        /**
         * {JSDoc}
         *
         * The splice() method changes the content of a string by removing a range of
         * characters and/or adding new characters.
         *
         * @this {String}
         * @param {number} start Index at which to start changing the string.
         * @param {number} delCount An integer indicating the number of old chars to remove.
         * @param {string} newSubStr The String that is spliced in.
         * @return {string} A new string with the spliced substring.
         */
        String.prototype.splice = function (start, delCount, newSubStr) {
          return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
        };
      }

      _export('GenericDatasource', GenericDatasource = function () {
        function GenericDatasource(instanceSettings, $q, backendSrv, templateSrv) {
          _classCallCheck(this, GenericDatasource);

          this.type = instanceSettings.type;
          this.name = instanceSettings.name;
          this.tushareproToken = instanceSettings.jsonData.tusharepro_token;
          this.apiUrl = instanceSettings.jsonData.tusharepro_api;
          this.q = $q;
          this.backendSrv = backendSrv;
          this.templateSrv = templateSrv;
        }

        _createClass(GenericDatasource, [{
          key: 'delay',
          value: function delay(t) {
            return new Promise(function (resolve) {
              setTimeout(resolve, t);
            });
          }
        }, {
          key: 'getTimeSeries',
          value: function getTimeSeries(options, retryInterval) {
            var _this = this;

            return this.backendSrv.datasourceRequest({
              url: this.apiUrl,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
              },
              data: {
                "api_name": options.api,
                "token": this.tushareproToken,
                "params": {
                  "ts_code": options.code,
                  "start_date": options.start,
                  "end_date": options.end
                }
              }
            }).then(function (resp) {
              if (resp.status === 200 && resp.data.code == 0) {
                var fieldIndex = resp.data.data.fields.indexOf(options.field);
                var ts = resp.data.data.items;

                var datapoints = _.map(ts, function (tup) {
                  return [parseFloat(tup[fieldIndex]), new Date(tup[1].splice(6, 0, "-").splice(4, 0, "-")).getTime()];
                }).reverse();

                var obj = {
                  target: options.code,
                  datapoints: datapoints
                };

                return obj;
              }
              return null;
            }).catch(function (err) {
              console.log(err);
              if (err.status == 404 || retryInterval > 5000) {
                var errors = {
                  message: "Error getting time series"
                };
                if (err.data && err.data.quandl_error) {
                  errors = {
                    message: err.data.quandl_error.message
                  };
                } else if (retryInterval > 10000) {
                  var errors = {
                    message: "Request timed out"
                  };
                }
                return _this.q.reject(errors);
              }

              var that = _this;
              /*
              return this.delay(retryInterval).then(function () {
                return that.getTimeSeries(options, retryInterval * 2);
              })
              */
            });
          }
        }, {
          key: 'query',
          value: function query(options) {
            var _this2 = this;

            var start = options.range.from.toISOString().substring(0, 10).replace('-', '');
            var end = options.range.to.toISOString().substring(0, 10).replace('-', '');

            options.targets = options.targets.filter(function (t) {
              return !t.hide;
            });

            var proms = _.map(options.targets, function (target) {
              return _this2.getTimeSeries({ api: target.api, code: target.code, field: target.field, start: start, end: end }, 2000);
            });
            return Promise.all(proms).then(function (data) {
              return { data: data };
            });
          }
        }, {
          key: 'testDatasource',
          value: function testDatasource() {
            console.log("test123");
            return this.backendSrv.datasourceRequest({
              url: this.apiUrl,
              method: "POST",
              headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
                'Access-Control-Allow-Headers': 'Origin, X-Requested-With, Content-Type, Accept'
              },
              data: {
                "api_name": "stock_basic",
                "token": this.tushareproToken,
                "params": {
                  "list_status": "P"
                }
              }
            }).then(function (response) {
              if (response.status === 200 && response.data.code == 0) {
                return { status: "success", message: "测试成功", title: "Success" };
              }
            });
          }
        }, {
          key: 'metricFindQuery',
          value: function metricFindQuery(options) {
            var _this3 = this;

            return new Promise(function (option) {
              if (option.api == "") {}
              var ret = _this3.mapToTextValue([{ text: '开盘价', value: 2 }, { text: '收盘价', value: 5 }]);
              return ret;
            });
          }
        }, {
          key: 'mapToTextValue',
          value: function mapToTextValue(result) {
            return _.map(result, function (d, i) {
              if (d && d.text && d.value) {
                return { text: d.text, value: d.value };
              } else if (_.isObject(d)) {
                return { text: d, value: i };
              }
              return { text: d, value: d };
            });
          }
        }]);

        return GenericDatasource;
      }());

      _export('GenericDatasource', GenericDatasource);
    }
  };
});
//# sourceMappingURL=datasource.js.map
