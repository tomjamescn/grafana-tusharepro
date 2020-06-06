import _ from "lodash";

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

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.name = instanceSettings.name;
    this.tushareproToken = instanceSettings.jsonData.tusharepro_token;
    this.apiUrl = instanceSettings.jsonData.tusharepro_api;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
  }

  delay(t) {
    return new Promise(function (resolve) {
      setTimeout(resolve, t)
    });
  }

  getTimeSeries(options, retryInterval) {
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
    }).then(resp => {
      if (resp.status === 200 && resp.data.code == 0) {
        var fieldIndex = resp.data.data.fields.indexOf(options.field);
        var ts = resp.data.data.items;

        var datapoints = _.map(ts, tup => {
          return [parseFloat(tup[fieldIndex]), new Date(tup[1].splice(6, 0, "-").splice(4, 0, "-")).getTime()]
        }).reverse();


        var obj = {
          target: options.code,
          datapoints: datapoints
        };

        return obj;
      }
      return null;
    }).catch(err => {
      console.log(err)
      if (err.status == 404 || retryInterval > 5000) {
        var errors = {
          message: "Error getting time series"
        }
        if (err.data && err.data.quandl_error) {
          errors = {
            message: err.data.quandl_error.message
          };
        }
        else if (retryInterval > 10000) {
          var errors = {
            message: "Request timed out"
          }
        }
        return this.q.reject(errors);
      }

      var that = this;
      /*
      return this.delay(retryInterval).then(function () {
        return that.getTimeSeries(options, retryInterval * 2);
      })
      */
    });
  }

  query(options) {
    var start = options.range.from.toISOString().substring(0, 10).replace('-', '');
    var end = options.range.to.toISOString().substring(0, 10).replace('-', '');


    options.targets = options.targets.filter(t => !t.hide);

    var proms = _.map(options.targets, target => {
      return this.getTimeSeries({api: target.api, code: target.code, field: target.field, start: start, end: end}, 2000);
    });
    return Promise.all(proms)
      .then(data => {
        return {data: data}
      })
  }

  testDatasource() {
    console.log("test123")
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
    }).then(response => {
      if (response.status === 200 && response.data.code == 0) {
        return {status: "success", message: "测试成功", title: "Success"};
      }
    });
  }

  metricFindQuery(options) {
    return new Promise(option => {
      if (option.api == "") {
      }
      var ret = this.mapToTextValue([
        {text: '开盘价', value: 2},
        {text: '收盘价', value: 5}
      ]);
      return ret;
    });
  }

  mapToTextValue(result) {
    return _.map(result, (d, i) => {
      if (d && d.text && d.value) {
        return {text: d.text, value: d.value};
      } else if (_.isObject(d)) {
        return {text: d, value: i};
      }
      return {text: d, value: d};
    });
  }
}
