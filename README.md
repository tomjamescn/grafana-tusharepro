## Grafana Tushare.pro Datasource
> 将tushare.pro的api作为数据源引入grafana，目前支持日线数据。框架搭好了，今后容易增加更多接口。


### 依赖
grafana >= 3.0.0即可，也支持最新的grafana 7.x

### 安装
去release页面下载最新版本，解压到grafana的plugins目录，重启启动grafana即可。

### 配置
![](https://raw.githubusercontent.com/tomjamescn/grafana-tusharepro/master/src/img/add-datasource-1.png)

![](https://raw.githubusercontent.com/tomjamescn/grafana-tusharepro/master/src/img/add-datasource-2.png)

#### 关于CORS跨域的说明
由于此datasource是grafana的普通datasouce，请求都是从浏览器直接发出的，所以需要后端数据api支持[CORS跨域](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)，目前tushare.pro的api应该还不支持。目前为了使用此插件，需要使用跨域代理，可以使用[cors-anywhere](https://github.com/Rob--W/cors-anywhere)


### 使用
![](https://raw.githubusercontent.com/tomjamescn/grafana-tusharepro/master/src/img/query.png)
