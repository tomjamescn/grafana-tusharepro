import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector, uiSegmentSrv) {
    super($scope, $injector);

    this.scope = $scope;
    this.uiSegmentSrv = uiSegmentSrv;
    console.log(this.target);
    this.target.code = this.target.code || '000001.SZ';
    this.target.field = this.target.field || 'close';
    this.target.target = this.target.target || 'daily/000001.SZ';
    this.target.api = this.target.target.split('/')[0] || 'daily';
    this.onChangeInternal();
  }

  code(c) {
    //翻译code
    if (c.charAt(0) == '6') {
      return c + '.SH'
    } else {
      return c + '.SZ'
    }
  }

  getOptions() {
    return this.datasource.metricFindQuery(this.target)
      .then(this.uiSegmentSrv.transformToSegments(false));
    // Options have to be transformed by uiSegmentSrv to be usable by metric-segment-model directive
  }

  getCodeOptions() {
    return Promise.all([])
  }

  getFieldOptions() {
    return this.datasource.metricFindQuery(this.target)
      .then(this.uiSegmentSrv.transformToSegments(false));
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal() {
    this.target.target = this.target.api + '/' + this.target.code;
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';
