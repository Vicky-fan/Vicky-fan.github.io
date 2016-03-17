## 1.点击
### 1.1 300ms的延迟？
当我们打开没有对移动端分辨率做兼容的PC网页，它开始是缩小来让我们看到整个页面的宽度。我们需要双击放大来查看页面内容。
双击——性能杀手，因为我们每点一次都要判断这是双击还是单击，浏览器设置了300ms的延迟，300ms内点击一次就是单击，点了两次就是双击。

一次触碰的工作方式：
1.touchstart
2.touchend
3.wait 300ms in case of another tap
4.click

#### 解决方法：
##### 一些基于 JavaScript 的解决方案
**1. zepto：用tap事件代替click**
tap: 用touchstart, touchmove, touchend模拟，满足基本条件：
* 从触摸到离开时间间隔短（>0, <.25s）
* 手指移动的距离短(<30s)

ps:提升用户体验：加上点击态
* 使用伪类:active(缺点：滚动时候也会出发样式)
* 使用js模拟点击态

```javascript
$el.on('tap', function(e){
	var $target = $(e.target);
    $target.addClass('active');
    
    setTimeout(function() {
    	$target.reomveClass('active');
    }, 150);
})
```
**2. FastClick**
专门为解决移动端浏览器 300 毫秒点击延迟问题所开发的一个轻量级的库。FastClick在检测到touched事件的时候，会通过DOM自定义事件立即触发一个模拟的click事件，并把浏览器在300ms后真正的click事件阻止掉。
```javascript
window.addEventListener( "load", function() {
    FastClick.attach( document.body );
}, false );
```
当 FastClick 检测到当前页面使用了基于 `<meta>` 标签或者 `touch-action` 属性的解决方案时，会静默退出。


##### 浏览器开发商提供的解决方案
**1. 禁用缩放**
`user-scalable=no`
缺点：完全禁用缩放，即你想要放大一张图片或者一段字体较小的文本，却发现无法完成操作。

**2. `width=device-width` **
在 Chrome 32 这一版中，他们将[在包含 width=device-width 或者置为比 viewport 值更小的页面上禁用双击缩放](https://codereview.chromium.org/18850005/)
它只是去除了双击缩放，但用户仍可以使用双指缩放
这一优化目前仅被 Chrome 32 及以上所支持

**3. IE指针事件**
`touch-action`:新 CSS 属性,是否触摸操作会触发用户代理的默认行为，将其置为 none 即可移除目标元素的 300 毫秒延迟
在 IE10 和 IE11 上移除了所有链接和按钮元素的点击延迟。
```css
a[href], button {
    -ms-touch-action: none; /* IE10 */
    touch-action: none;     /* IE11 */
}
```
在 `<body>` 元素上设置 `touch-action: none`，这就彻底禁用了双击缩放 (注：这也同时禁用了双指缩放)

>JavaScript 的方案很好地解决了延迟问题，但毕竟只是临时的措施
>浏览器本身所提供的方案,更属长久之计


### 1.2 zepto的tap点透
![tap](https://cloud.githubusercontent.com/assets/5628537/13246581/91a9dd94-da4f-11e5-95ce-7b4b8553b158.gif)

##### 问题：
* 使用原生touch事件也存在点击穿透的问题，因为click是在touch系列事件发生后大约300ms才触发的，混用touch和click肯定会导致点透问题。如果绑定touch方法的dom元素在tap方法触发后会隐藏、css3 transfer移走、requestAnimationFrame移走等，而“隐藏、移走”后，它底下同一位置正好有一个dom元素绑定了click的事件、或者有浏览器认为可以被点击有交互反应的dom元素（举例：如input type=text被点击有交互反应是获得焦点并弹起虚拟键盘），则会出现“点透”现象。
* a标签超链接,自带默认行为（如href）,绑定tap事件处理业务后，无法直接取消默认行为。

##### 解决方法：
1.  FastClick 
2.  将tap事件改为touchend
3. 不要混用touch和click

> 方案三视情况而定
> 如果只用touch需要特别注意a标签，a标签的href也是click，需要去掉换成js控制的跳转或者用其他标签代替a 
>如果只用click，交互会有300ms延迟

http://blog.youyo.name/archives/zepto-tap-click-through-research.html
