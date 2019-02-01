import Vue from 'vue'
import Router from 'vue-router'
import componentList from '../componentList.js'

Vue.use(Router)

const router = () => {
  let routes = [
    {
      path: '/', 
      component: r => require.ensure([], () => r(require('../pages/about.md')))
    }]

  componentList.list.map((pageGroup) => {
    const arr = pageGroup.list.map((page) => {
      const component = r => require.ensure([], () => r(require(`../pages${page.path}.md`)))
      return {
        path: `${page.path}`,
        component
      }
    })
    routes = routes.concat(arr)
  })
  return routes
}

export default  new Router({
  scrollBehavior: (to, from, savedPosition) => {
    document.querySelector('.main--right').scrollTop = 0
  },
  routes: router()
})
