##2 滚动
>全局滚动：滚动条在body节点或更顶层
>局部滚动：滚动条在body节点下的某个dom节点上

### 2.1 弹性滚动
#### 2.11 iso
全局滚动： 默认支持
局部滚动：没有滚动条，滑动起来干涩
![ios scroll1](https://cloud.githubusercontent.com/assets/5628537/13274475/6fe3c94e-dae6-11e5-9b97-2a8876e4e8d5.gif)
##### 让局部滚动支持弹性滚动
```css
body {
	-webkit-overflow-scrolling: touch;
}
/* 局部滚动的dom节点 */
.element {
	overflow: auto;
}
```

#### 2.12 Android
默认没有弹性滚动，默认浏览器不支持-webkit-overflow-scrolling，Android版chrom支持

### 2.2 滚动出界
#### 2.21 iso
出现的情况：
* 全局滚动： 滚动到页面顶部（或底部）时继续向下（向上）滑动
*局部滚动： 滚动到页面顶部（或底部）时，手指离开停下，在继续向下（向上）滑动
![ios scroll2](https://cloud.githubusercontent.com/assets/5628537/13313317/00a5f834-dbd8-11e5-9950-9bf912a30db0.gif)

##### 解决方案
**局部滚动:**
ScrollFix
![scrollfix](https://cloud.githubusercontent.com/assets/5628537/13379542/029639c8-de63-11e5-9fa4-1f15065399dd.png)

这种出界一般都是在顶部和底部继续划才会出现，scrollFix监听touchStart事件。当手指滑动到顶部，就向下移动一个像素，反之，在页面底部就向上移动一个像素
ps:如果页面有固定的区域，固定区域的禁止touchmove的默认事件
**全局滚动:**
暂时没有解决方案，但是可以考虑把全局滚动改成局部滚动，包多一层。
ps:从iso8开始，safair出界部分的颜色和body的背景颜色一致

![Android scroll4](https://cloud.githubusercontent.com/assets/5628537/13274477/739bb5d8-dae6-11e5-9d13-cbdb9de88b18.gif)

#### 2.22 Android
局部滚动，滚动条滞后，反应慢（显示异常，滚动不流畅）~
![Android scroll4](https://cloud.githubusercontent.com/assets/5628537/13313250/7fb8b6d0-dbd7-11e5-8546-b005a019b65d.gif)
解决方案：
iscroll

