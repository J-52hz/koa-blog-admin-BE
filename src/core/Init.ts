import Koa from 'koa'
import http from 'http'
import koaBody from 'koa-body'
import path from 'path'
import { getAllFilesExport } from '../common/utils/utils'
import Router from 'koa-router'
import Config from '../config/Config'
import catchError from '../middleware/common/catchError'
import { initPlugin } from '../plugin/index'
import '../models/index'
class Init {
  public static app: Koa<Koa.DefaultState, Koa.DefaultContext>
  public static server: http.Server
  public static initCore(app: Koa<Koa.DefaultState, Koa.DefaultContext>, server: http.Server) {
    Init.app = app
    Init.server = server
    Init.loadBodyParser()
    Init.initCatchError()
    Init.initLoadRouters()
    Init.initPlugin()
  }

  // 解析body参数
  public static loadBodyParser() {
    Init.app.use(
      koaBody({
        multipart: true, // 支持文件上传
        // encoding: 'gzip',
        formidable: {
          maxFieldsSize: 2 * 1024 * 1024, // 最大文件为2兆
          keepExtensions: true // 保持文件的后缀
        }
      })
    )
  }

  // http路由加载
  static async initLoadRouters() {
    const dirPath = path.join(`${process.cwd()}/${Config.BASE}/router/`)
    getAllFilesExport(dirPath, (file: Router) => {
      Init.app.use(file.routes())
    })
  }

  // 错误监听和日志处理
  public static initCatchError() {
    Init.app.use(catchError)
  }

  public static initPlugin() {
    initPlugin({
      pluginNames: ['WebSocket'],
      app: Init.app,
      server: Init.server
    })
  }
}

export default Init.initCore
