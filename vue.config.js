//修改配置的文件，会与隐藏的webpack.config.js合并并生效 vue.config.js的名字是固定的
//隐藏的cli配置文件在node_modules/@vue/cli-service/lib/config中
module.exports={
    configureWebpack:{
        resolve:{
            alias:{
                'assets':'@/assets',
                'common':'@/common',
                'components':'@/components',
                'views':'@/views',
                'musics':'@/assets/musics',
                'images':'@/assets/images'
            }
        }   
    }
}