<template>
  <div class="header">
    <img class="logo" src="./assets/logo.png" alt="logo" />
    <span class="title">前端监控 test</span>
  </div>
  <nav>
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </nav>
  <router-view />
</template>

<script>
import { findCodeBySourceMap } from './src/utils/sourcemap';
// import { unzip } from '../utils/recordScreen.js';
// import rrwebPlayer from 'rrweb-player';
// import 'rrweb-player/dist/style.css';

export default {
  name: 'HomeView',
  data() {
    return {
      fullscreen: true,
      revertdialog: false,
      dialogTitle: '',
      activities: [],
      tableData: []
    };
  },
  created() {
    this.getTableData();
  },
  methods: {
    getTableData() {
      setTimeout(() => {
        fetch(`http://localhost:8083/getErrorList`)
          .then((response) => response.json())
          .then((res) => {
            this.tableData = res.data;
          });
      }, 500);
    },
    fetchError() {
      fetch('https://jsonplaceholder.typicode.com/posts/a', {
        method: 'POST',
        header: {
          'Content-Type': 'application/json;charset=UTF-8'
        },
        body: { id: 1 }
      })
        .then((res) => {
          if (res.status == 404) {
            this.getTableData();
          }
        })
        .catch(() => {
          this.getTableData();
        });
    },
    revertBehavior({ breadcrumb }) {
      this.dialogTitle = '查看用户行为';
      this.fullscreen = false;
      this.revertdialog = true;
      breadcrumb.forEach((item) => {
        item.color = item.status == 'ok' ? '#5FF713' : '#F70B0B';
        item.icon = item.status == 'ok' ? 'el-icon-check' : 'el-icon-close';
        if (item.category == 'Click') {
          item.content = `用户点击dom: ${item.data}`;
        } else if (item.category == 'Http') {
          item.content = `调用接口: ${item.data.url}, ${
            item.status == 'ok' ? '请求成功' : '请求失败'
          }`;
        } else if (item.category == 'Code_Error') {
          item.content = `代码报错：${item.data.message}`;
        } else if (item.category == 'Resource_Error') {
          item.content = `加载资源报错：${item.message}`;
        } else if (item.category == 'Route') {
          item.content = `路由变化：从 ${item.data.from}页面 切换到 ${item.data.to}页面`;
        }
      });
      this.activities = breadcrumb;
    },
    revertCode(row) {
      findCodeBySourceMap(row, (res) => {
        this.dialogTitle = '查看源码';
        this.fullscreen = false;
        this.revertdialog = true;
        this.$nextTick(() => {
          this.$refs.revert.innerHTML = res;
        });
      });
    },
    // playRecord(id) {
    //   fetch(`http://localhost:8083/getRecordScreenId?id=${id}`)
    //     .then((response) => response.json())
    //     .then((res) => {
    //       let { code, data } = res;
    //       if (code == 200 && Array.isArray(data) && data[0] && data[0].events) {
    //         let events = unzip(data[0].events);
    //         this.fullscreen = true;
    //         this.dialogTitle = '播放录屏';
    //         this.revertdialog = true;
    //         this.$nextTick(() => {
    //           new rrwebPlayer(
    //             {
    //               target: document.getElementById('revert'),
    //               data: {
    //                 events
    //               }
    //             },
    //             {
    //               UNSAFE_replayCanvas: true
    //             }
    //           );
    //         });
    //       } else {
    //         this.$message({
    //           message: '暂无数据，请稍后重试~',
    //           type: 'warning'
    //         });
    //       }
    //     });
    // },
    format(time) {
      let str = new Date(time);
      return (
        str.toLocaleDateString().replace(/\//g, '-') +
        ' ' +
        str.toTimeString().substr(0, 8)
      );
    },
    asyncError() {
      this.getTableData();
      setTimeout(() => {
        JSON.parse('');
      });
    },
    codeErr() {
      this.getTableData();
      let a = undefined;
      if (a.length) {
        console.log('1');
      }
    },
    resourceError() {
      let script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = 'https://abc.com/index.js';
      document.body.appendChild(script);
      // 资源加载失败
      script.onerror = () => {
        this.getTableData();
      };
    },
    promiseErr() {
      new Promise((resolve) => {
        this.getTableData();
        let person = {};
        person.name.age();
        resolve();
      });
    },

    xhrError() {
      let _this = this;
      let ajax = new XMLHttpRequest();
      ajax.open('GET', 'https://abc.com/test/api');
      ajax.setRequestHeader('content-type', 'application/json');
      ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
          _this.getTableData();
        }
        if (ajax.status === 200 || ajax.status === 304) {
          console.log('ajax', ajax);
        }
      };
      ajax.send();
      ajax.addEventListener('loadend', () => {});
    }
  }
};
</script>
<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0 10px;

  .header {
    width: 100%;
    padding: 10px 20px;
    height: 60px;
    text-align: left;
    background-color: #ffffff;
    border-bottom: 1px solid #eee;
    display: flex;
    align-items: center;
    position: sticky;
    top: 0;
    z-index: 1;
    .logo {
      width: 70px;
      height: 42px;
    }
    .title {
      margin-left: 10px;
      font-weight: bold;
    }
  }
}

nav {
  padding: 10px;

  a {
    font-weight: bold;
    color: #2c3e50;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}

* {
  margin: 0;
}
</style>
