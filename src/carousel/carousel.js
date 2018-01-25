import React from 'react';
import PropTypes from 'prop-types'
import tweenState from './tween/ReactTweenState'
import easingTypes from './tween/tween-functions';
import BottomCenterDecorator from "./decorators/bottom-center-decorator";
// var ExecutionEnvironment = require('exenv');

// const addEvent = function(elem, type, eventHandle) {
//     if (elem === null || typeof elem === 'undefined') {
//         return;
//     }
//     if (elem.addEventListener) {
//         elem.addEventListener(type, eventHandle, false);
//     } else if (elem.attachEvent) {
//         elem.attachEvent('on' + type, eventHandle);
//     } else {
//         elem['on' + type] = eventHandle;
//     }
// };

// const removeEvent = function(elem, type, eventHandle) {
//     if (elem === null || typeof elem === 'undefined') {
//         return;
//     }
//     if (elem.removeEventListener) {
//         elem.removeEventListener(type, eventHandle, false);
//     } else if (elem.detachEvent) {
//         elem.detachEvent('on' + type, eventHandle);
//     } else {
//         elem['on' + type] = null;
//     }
// };

class Carousel extends tweenState {

    constructor(props) {
        super(props);
        let stateObj = {}
        if(this.state){
            stateObj  = Object.assign({}, stateObj, this.state)
        }
        stateObj  = Object.assign({}, {
            currentSlide: this.props.slideIndex,
            dragging: false,
            frameWidth: 0,
            left: 0,
            slideCount: 0,
            slidesToScroll: this.props.slidesToScroll,
            slideWidth: 0,
            top: 0,
        }, stateObj);

        this.state = stateObj;
        this.clickSafe = true;
        this.autoplayID = null;
        this.touchObject = {};
    }


    onResize() {
        this.setDimensions();
    }

    onReadyStateChange() {
        this.setDimensions();
    }

    // bindEvents() {
    //     var self = this;
    //     if (ExecutionEnvironment.canUseDOM) {
    //         addEvent(window, 'resize', self.onResize);
    //         addEvent(document, 'readystatechange', self.onReadyStateChange);
    //     }
    // }
    // unbindEvents() {
    //     var self = this;
    //     if (ExecutionEnvironment.canUseDOM) {
    //         removeEvent(window, 'resize', self.onResize);
    //         removeEvent(document, 'readystatechange', self.onReadyStateChange);
    //     }
    // }


    /**
     * ----------------------------------------------- 生命周期 start --------------------------------
     */
    componentWillMount() {
        this.setInitialDimensions();
    }

    componentDidMount() {
        this.setDimensions();
        // this.bindEvents();
        this.setExternalData();
        if (this.props.autoplay) {
            this.startAutoplay();
        }
    }

    componentWillReceiveProps(nextProps) {
        //更新滑动轮播界面数量状态
        this.setState({
            slideCount: nextProps.children.length,
        })

        this.setDimensions(nextProps);

        if (this.props.slideIndex != nextProps.slideIndex && nextProps.slideIndex != this.state.currentSlide) {
            this.goToSlide(nextProps.slideIndex);
        }

        if (this.props.autoplay !== nextProps.autoplay) {
            if (nextProps.autoplay) {
                this.startAutoplay();
            } else {
                this.stopAutoplay();
            }
        }

    }

    componentWillUnmount() {
        super.componentWillUnmount()
        // this.unbindEvents();//注销事件绑定
        this.stopAutoplay();//停止自动轮播
    }

    /**
     * ----------------------------------------------- 生命周期 end --------------------------------
     */


    /**
     * 计算并初始化轮播图参数：
     * 1. 计算滑动slideWidth
     */
    setInitialDimensions() {

        let self = this;
        let slideWidth;//单个滑动界面的宽度距离
        let slideHeight;//单个滑动界面的高度
        let frameHeight;//整个自动轮播的高度

        //计算滑动宽度：
        // 如果是上下方向滑动，计算滑动的宽度。
        if (this.props.vertical) {
            slideWidth = this.props.initialSlideHeight || 0;
        } else {
            slideWidth = this.props.initialSlideWidth || 0;
        }

        //计算滑动的高度
        if (this.props.initialSlideHeight) {
            slideHeight = this.props.initialSlideHeight * this.props.slidesToShow
        } else {
            slideHeight = 0;
        }

        //计算，在垂直方向，整个轮播图的高度
        frameHeight = slideHeight + this.props.cellSpacing * (this.props.slidesToShow - 1);


        this.setState(
            {
                slideWidth: slideWidth,
                slideHeight: slideHeight,
                frameWidth: this.props.vertical ? frameHeight : '100%',
                slideCount: React.Children.count(this.props.children),

            }, () => {//页面变化完成后的回调该函数，等价于componentDidUpdate
                self.setLeft();
                self.setExternalData();
            });


    }

    setDimensions(props) {
        props = props || this.props;

        var self = this,
            slideWidth,
            slidesToScroll,
            firstSlide,
            frame,
            frameWidth,
            frameHeight,
            slideHeight;

        slidesToScroll = props.slidesToScroll;
        frame = this.refs.frame;
        firstSlide = frame.childNodes[0].childNodes[0];
        if (firstSlide) {
            firstSlide.style.height = '100%';
            slideHeight = this.props.vertical? firstSlide.offsetHeight * props.slidesToShow : firstSlide.offsetHeight;
        } else {
            slideHeight = 100;
        }

        if (typeof props.slideWidth !== 'number') {
            slideWidth = parseInt(props.slideWidth);
        } else {
            if (props.vertical) {
                slideWidth = slideHeight / props.slidesToShow * props.slideWidth;
            } else {
                slideWidth = frame.offsetWidth / props.slidesToShow * props.slideWidth;
            }
        }

        if (!props.vertical) {
            slideWidth -= props.cellSpacing * ((100 - 100 / props.slidesToShow) / 100);
        }

        frameHeight = slideHeight + props.cellSpacing * (props.slidesToShow - 1);
        frameWidth = props.vertical ? frameHeight : frame.offsetWidth;

        if (props.slidesToScroll === 'auto') {
            slidesToScroll = Math.floor(
                frameWidth / (slideWidth + props.cellSpacing)
            );
        }

        this.setState(
            {
                slideHeight: slideHeight,
                frameWidth: frameWidth,
                slideWidth: slideWidth,
                slidesToScroll: slidesToScroll,
                left: props.vertical ? 0 : this.getTargetLeft(),
                top: props.vertical ? this.getTargetLeft() : 0,
            },
            function () {
                self.setLeft();
            }
        );
    }

    setLeft() {
        this.setState({
            left: this.props.vertical ? 0 : this.getTargetLeft(),
            top: this.props.vertical ? this.getTargetLeft() : 0,
        });
    };


    setExternalData() {
        if (this.props.data) {
            this.props.data();
        }
    }


    /**
     * 计算滑动目标向左移动的偏移量
     */
    getTargetLeft(touchOffset, slide) {
        //移动的偏移量
        let offset;
        //移动目标（对应的移动目标的索引）
        let target = slide || this.state.currentSlide;
        switch (this.props.cellAlign) {
            case 'left': { //向左自动移动的临界值
                offset = 0;
                offset -= this.props.cellSpacing * target;
                break;
            }
            case 'center': {//向中间自动移动的临界值
                offset = (this.state.frameWidth - this.state.slideWidth) / 2;
                offset -= this.props.cellSpacing * target;
                break;
            }
            case 'right': {//向右自动移动的临界值
                offset = this.state.frameWidth - this.state.slideWidth;
                offset -= this.props.cellSpacing * target;
                break;
            }
        }

        //计算移动的目标对象距离左侧的距离
        let left = this.state.slideWidth * target;

        //计算当前滑动目标对象是否最后一个
        let lastSlide = this.state.currentSlide > 0 && target + this.state.slidesToScroll >= this.state.slideCount;

        if (lastSlide && this.props.slideWidth !== 1 && !this.props.wrapAround && this.props.slidesToScroll === 'auto') {
            left = this.state.slideWidth * this.state.slideCount - this.state.frameWidth;
            offset = 0;
            offset -= this.props.cellSpacing * (this.state.slideCount - 1);
        }

        offset -= touchOffset || 0;

        return (left - offset) * -1;


    }

    /**
     * 开始自动轮播
     */
    startAutoplay() {
        this.autoplayID = setInterval(
            () => {this.autoplayIterator()},
            this.props.autoplayInterval
        );


    }

    autoplayIterator() {
        if (this.props.wrapAround) {
            this.nextSlide()
            return;

        }

        if (this.state.currentSlide !== this.state.slideCount - this.state.slidesToShow) {
            this.nextSlide();
        } else {
            this.stopAutoplay();
        }

    }

    /**
     * 停止自动轮播
     */
    stopAutoplay() {
        this.autoplayID && clearInterval(this.autoplayID);
    }

    resetAutoplay() {
        if (this.props.autoplay && !this.autoplayPaused) {
            this.stopAutoplay();
            this.startAutoplay();
        }
    }

    /**
     * 根据索引，切换欢动到对应的界面
     */
    goToSlide(index) {
        var self = this;
        if (index >= React.Children.count(this.props.children) || index < 0) {
            if (!this.props.wrapAround) {
                return;
            }
            if (index >= React.Children.count(this.props.children)) {
                this.props.beforeSlide(this.state.currentSlide, 0);
                return this.setState(
                    {
                        currentSlide: 0,
                    },
                    function () {
                        self.animateSlide(
                            null,
                            null,
                            self.getTargetLeft(null, index),
                            function () {
                                self.animateSlide(null, 0.01);
                                self.props.afterSlide(0);
                                self.resetAutoplay();
                                self.setExternalData();
                            }
                        );
                    }
                );
            } else {
                var endSlide =
                    React.Children.count(this.props.children) - this.state.slidesToScroll;
                this.props.beforeSlide(this.state.currentSlide, endSlide);
                return this.setState(
                    {
                        currentSlide: endSlide,
                    },
                    function () {
                        self.animateSlide(
                            null,
                            null,
                            self.getTargetLeft(null, index),
                            function () {
                                self.animateSlide(null, 0.01);
                                self.props.afterSlide(endSlide);
                                self.resetAutoplay();
                                self.setExternalData();
                            }
                        );
                    }
                );
            }
        }

        this.props.beforeSlide(this.state.currentSlide, index);

        if (index !== this.state.currentSlide) {
            this.props.afterSlide(index);
        }
        this.setState(
            {
                currentSlide: index,
            },
            function () {
                self.animateSlide();
                self.resetAutoplay();
                self.setExternalData();
            }
        );
    }

    /**
     * 滑动到下一页
     * @returns {*}
     */
    nextSlide() {
        var childrenCount = React.Children.count(this.props.children);
        var slidesToShow = this.props.slidesToShow;
        if (this.props.slidesToScroll === 'auto') {
            slidesToShow = this.state.slidesToScroll;
        }
        if (
            this.state.currentSlide >= childrenCount - slidesToShow &&
            !this.props.wrapAround
        ) {
            return;
        }

        if (this.props.wrapAround) {
            this.goToSlide(this.state.currentSlide + this.state.slidesToScroll);
        } else {
            if (this.props.slideWidth !== 1) {
                return this.goToSlide(
                    this.state.currentSlide + this.state.slidesToScroll
                );
            }
            this.goToSlide(
                Math.min(
                    this.state.currentSlide + this.state.slidesToScroll,
                    childrenCount - slidesToShow
                )
            );
        }
    }

    /**
     * 滑动到上一页
     */
    previousSlide() {
        if (this.state.currentSlide <= 0 && !this.props.wrapAround) {
            return;
        }

        if (this.props.wrapAround) {
            this.goToSlide(this.state.currentSlide - this.state.slidesToScroll);
        } else {
            this.goToSlide(
                Math.max(0, this.state.currentSlide - this.state.slidesToScroll)
            );
        }
    }

    /**
     * 动画切换
     */
    animateSlide(easing, duration, endValue, callback) {
        this.tweenState(this.props.vertical ? 'top' : 'left', {
            easing: easing || easingTypes[this.props.easing],
            duration: duration || this.props.speed,
            endValue: endValue || this.getTargetLeft(),
            onEnd: callback || null,
        });
    }

    /**
     * 鼠标按下时，如果自动轮播，停止自动轮播。
     */
    handleMouseOver() {
        if (this.props.autoplay) {
            this.autoplayPaused = true;
            this.stopAutoplay();
        }
    }

    /**
     * 当鼠标离开，开启自动播放
     */
    handleMouseOut() {
        if (this.props.autoplay && this.autoplayPaused) {
            this.startAutoplay();
            this.autoplayPaused = null;
        }
    }

    /**
     * 计算手指在界面上的方向
     */
    swipeDirection(x1, x2, y1, y2) {
        var xDist, yDist, r, swipeAngle;

        xDist = x1 - x2;
        yDist = y1 - y2;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }
        if (swipeAngle <= 45 && swipeAngle >= 0) {
            return 1;
        }
        if (swipeAngle <= 360 && swipeAngle >= 315) {
            return 1;
        }
        if (swipeAngle >= 135 && swipeAngle <= 225) {
            return -1;
        }
        if (this.props.vertical === true) {
            if (swipeAngle >= 35 && swipeAngle <= 135) {
                return 1;
            } else {
                return -1;
            }
        }
        return 0;
    }

    /**
     * 手指移动切换
     * @param e
     */
    handleSwipe(e) {
        if (
            typeof this.touchObject.length !== 'undefined' &&
            this.touchObject.length > 44
        ) {
            this.clickSafe = true;
        } else {
            this.clickSafe = false;
        }

        var slidesToShow = this.props.slidesToShow;
        if (this.props.slidesToScroll === 'auto') {
            slidesToShow = this.state.slidesToScroll;
        }

        if (this.touchObject.length > this.state.slideWidth / slidesToShow / 5) {
            if (this.touchObject.direction === 1) {
                if (
                    this.state.currentSlide >=
                    React.Children.count(this.props.children) - slidesToShow &&
                    !this.props.wrapAround
                ) {
                    this.animateSlide(easingTypes[this.props.edgeEasing]);
                } else {
                    this.nextSlide();
                }
            } else if (this.touchObject.direction === -1) {
                if (this.state.currentSlide <= 0 && !this.props.wrapAround) {
                    this.animateSlide(easingTypes[this.props.edgeEasing]);
                } else {
                    this.previousSlide();
                }
            }
        } else {
            this.goToSlide(this.state.currentSlide);
        }

        this.touchObject = {};

        this.setState({
            dragging: false,
        });
    }


    /**
     * ----------------------------------------------- 事件处理机制 start --------------------------------
     */
    getTouchEvents() {
        const self = this;
        //手指正在移动中
        if (self.props.swiping === false) {
            return null;
        }

        return {

            onTouchStart(e) {
                self.touchObject = {
                    startX: e.touches[0].pageX,
                    startY: e.touches[0].pageY,
                };
                self.handleMouseOver();
            },
            onTouchMove(e) {
                var direction = self.swipeDirection(
                    self.touchObject.startX,
                    e.touches[0].pageX,
                    self.touchObject.startY,
                    e.touches[0].pageY
                );

                if (direction !== 0) {
                    e.preventDefault();
                }

                var length = self.props.vertical
                    ? Math.round(
                        Math.sqrt(
                            Math.pow(e.touches[0].pageY - self.touchObject.startY, 2)
                        )
                    )
                    : Math.round(
                        Math.sqrt(
                            Math.pow(e.touches[0].pageX - self.touchObject.startX, 2)
                        )
                    );

                self.touchObject = {
                    startX: self.touchObject.startX,
                    startY: self.touchObject.startY,
                    endX: e.touches[0].pageX,
                    endY: e.touches[0].pageY,
                    length: length,
                    direction: direction,
                };

                self.setState({
                    left: self.props.vertical
                        ? 0
                        : self.getTargetLeft(
                            self.touchObject.length * self.touchObject.direction
                        ),
                    top: self.props.vertical
                        ? self.getTargetLeft(
                            self.touchObject.length * self.touchObject.direction
                        )
                        : 0,
                });
            },
            onTouchEnd(e) {
                self.handleSwipe(e);
                self.handleMouseOut();
            },
            onTouchCancel(e) {
                self.handleSwipe(e);
            },
        };
    }

    getMouseEvents() {
        var self = this;

        if (this.props.dragging === false) {
            return null;
        }

        return {
            onMouseOver() {
                self.handleMouseOver();
            },
            onMouseOut() {
                self.handleMouseOut();
            },
            onMouseDown(e) {
                self.touchObject = {
                    startX: e.clientX,
                    startY: e.clientY,
                };

                self.setState({
                    dragging: true,
                });
            },
            onMouseMove(e) {
                if (!self.state.dragging) {
                    return;
                }

                var direction = self.swipeDirection(
                    self.touchObject.startX,
                    e.clientX,
                    self.touchObject.startY,
                    e.clientY
                );

                if (direction !== 0) {
                    e.preventDefault();
                }

                var length = self.props.vertical
                    ? Math.round(
                        Math.sqrt(Math.pow(e.clientY - self.touchObject.startY, 2))
                    )
                    : Math.round(
                        Math.sqrt(Math.pow(e.clientX - self.touchObject.startX, 2))
                    );

                self.touchObject = {
                    startX: self.touchObject.startX,
                    startY: self.touchObject.startY,
                    endX: e.clientX,
                    endY: e.clientY,
                    length: length,
                    direction: direction,
                };

                self.setState({
                    left: self.props.vertical
                        ? 0
                        : self.getTargetLeft(
                            self.touchObject.length * self.touchObject.direction
                        ),
                    top: self.props.vertical
                        ? self.getTargetLeft(
                            self.touchObject.length * self.touchObject.direction
                        )
                        : 0,
                });
            },
            onMouseUp(e) {
                if (!self.state.dragging) {
                    return;
                }

                self.handleSwipe(e);
            },
            onMouseLeave(e) {
                if (!self.state.dragging) {
                    return;
                }

                self.handleSwipe(e);
            },
        };
    }

    handleClick(e) {
        if (this.clickSafe === true) {
            e.preventDefault();
            e.stopPropagation();

            if (e.nativeEvent) {
                e.nativeEvent.stopPropagation();
            }
        }
    }

    /**
     * ----------------------------------------------- 事件处理机制 end --------------------------------
     */

    render() {
        const _this  = this;
        const  children = React.Children.count(this.props.children) > 1 ? this.formatChildren(this.props.children) : this.props.children;
        const sliderStyle = this.props.style ? {...Object.assign(this.getSliderStyles(),this.props.style || {})} : this.getSliderStyles();
        return (
            <div
                className={['slider', this.props.className || ''].join(' ')}
                ref="slider"
                style={sliderStyle}>

                {/*渲染轮播图*/}

                <div
                    className="slider-frame"
                    ref="frame"
                    style={this.getFrameStyles()}
                    {...this.getTouchEvents()}
                    {...this.getMouseEvents()}
                    onClick={(e) => this.handleClick(e)}
                >
                    <ul className="slider-list" ref="list" style={this.getListStyles()}>
                        {children}
                    </ul>
                </div>

                {/*渲染指示器组件*/}


                {_this.props.decorators ? _this.renderDecorators() : null}



            </div>
        );
    }

    /**
     * 渲染指示器
     */
    renderDecorators(){
        const _this = this;
         return this.props.decorators.map((Decorator, index) => (

                    <div style={Object.assign(_this.getDecoratorStyles(Decorator.position), Decorator.style || {})}
                        className={'slider-decorator-' + index}
                        key={index}>
                        <Decorator.component
                            currentSlide={_this.state.currentSlide}
                            slideCount={_this.state.slideCount}
                            frameWidth={_this.state.frameWidth}
                            slideWidth={_this.state.slideWidth}
                            slidesToScroll={_this.state.slidesToScroll}
                            cellSpacing={_this.props.cellSpacing}
                            slidesToShow={_this.props.slidesToShow}
                            wrapAround={_this.props.wrapAround}
                            nextSlide={_this.nextSlide}
                            previousSlide={_this.previousSlide}
                            goToSlide={_this.goToSlide}
                        />

                    </div>
            )
        )
    }

    getDecoratorStyles(position) {
        switch (position) {
            case 'TopLeft': {
                return {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                };
            }
            case 'TopCenter': {
                return {
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    WebkitTransform: 'translateX(-50%)',
                    msTransform: 'translateX(-50%)',
                };
            }
            case 'TopRight': {
                return {
                    position: 'absolute',
                    top: 0,
                    right: 0,
                };
            }
            case 'CenterLeft': {
                return {
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    transform: 'translateY(-50%)',
                    WebkitTransform: 'translateY(-50%)',
                    msTransform: 'translateY(-50%)',
                };
            }
            case 'CenterCenter': {
                return {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%,-50%)',
                    WebkitTransform: 'translate(-50%, -50%)',
                    msTransform: 'translate(-50%, -50%)',
                };
            }
            case 'CenterRight': {
                return {
                    position: 'absolute',
                    top: '50%',
                    right: 0,
                    transform: 'translateY(-50%)',
                    WebkitTransform: 'translateY(-50%)',
                    msTransform: 'translateY(-50%)',
                };
            }
            case 'BottomLeft': {
                return {
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                };
            }
            case 'BottomCenter': {
                return {
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    WebkitTransform: 'translateX(-50%)',
                    msTransform: 'translateX(-50%)',
                };
            }
            case 'BottomRight': {
                return {
                    position: 'absolute',
                    bottom: 0,
                    right: 0,
                };
            }
            default: {
                return {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                };
            }
        }
    }
    /**
     * 整个轮播图组件的样式
     */
    getSliderStyles() {
        return {
            position: 'relative',
            display: 'block', //此元素将显示为块级元素
            width: this.props.width,
            height: '100%',
            boxSizing: 'border-box', //让元素的width/height 等同于 内容的 width/height
            MozBoxSizing: 'border-box',
            visibility: this.state.slideWidth ? 'visible' : 'hidden',
        };
    }

    /**
     * 轮播图列表样式
     */
    getListStyles() {
        var listWidth =
            this.state.slideWidth * React.Children.count(this.props.children);
        var spacingOffset =
            this.props.cellSpacing * React.Children.count(this.props.children);
        var transform =
            'translate3d(' +
            this.getTweeningValue('left') +
            'px, ' +
            this.getTweeningValue('top') +
            'px, 0)';
        return {
            transform,
            WebkitTransform: transform,
            msTransform:
            'translate(' +
            this.getTweeningValue('left') +
            'px, ' +
            this.getTweeningValue('top') +
            'px)',
            position: 'relative',
            display: 'block',
            margin: this.props.vertical
                ? this.props.cellSpacing / 2 * -1 + 'px 0px'
                : '0px ' + this.props.cellSpacing / 2 * -1 + 'px',
            padding: 0,
            height: this.props.vertical
                ? '100%' // before: listWidth + spacingOffset
                : '100%', // before:this.state.slideHeight
            width: this.props.vertical ? '100%' : listWidth + spacingOffset, // before : 'auto'
            cursor: this.state.dragging === true ? 'pointer' : 'inherit',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box',
        };
    }

    /**
     * 轮播图中，每个界面的样式
     * @param index
     * @param positionValue
     */
    getSlideStyles(index, positionValue) {
        let targetPosition = this.getSlideTargetPosition(index, positionValue);
        return {
            position: 'absolute',
            left: this.props.vertical ? 0 : targetPosition,
            top: this.props.vertical ? targetPosition : 0,
            display: this.props.vertical ? 'block' : 'inline-block',
            listStyleType: 'none',
            textAlign:'top', //before ： top
            width: this.props.vertical ? '100%' : this.state.slideWidth,
            height:'100%',//before: 'auto'
            backgroundColor: 'transparent',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box',
            marginLeft: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
            marginRight: this.props.vertical ? 'auto' : this.props.cellSpacing / 2,
            marginTop: this.props.vertical ? this.props.cellSpacing / 2 : 'auto',
            marginBottom: this.props.vertical ? this.props.cellSpacing / 2 : 'auto',
        };
    }

    /**
     * 计算图片滚动到的目标位置
     * @param index
     * @param positionValue
     * @returns {number}
     */
    getSlideTargetPosition(index, positionValue) {
        let slidesToShow = this.state.frameWidth / this.state.slideWidth;

        //目标对象开始滚动的位置
        let targetPosition = (this.state.slideWidth + this.props.cellSpacing) * index;

        //目标对象滚动到位置
        let end = (this.state.slideWidth + this.props.cellSpacing) * slidesToShow * -1;

        if (this.props.wrapAround) {//无限轮播

            let slidesBefore = Math.ceil(positionValue / this.state.slideWidth);

            if (this.state.slideCount - slidesBefore <= index) {
                return ( (this.state.slideWidth + this.props.cellSpacing) * (this.state.slideCount - index) * -1 );
            }

            let slidesAfter = Math.ceil((Math.abs(positionValue) - Math.abs(end)) / this.state.slideWidth);

            if (this.state.slideWidth !== 1) {
                slidesAfter = Math.ceil((Math.abs(positionValue) - this.state.slideWidth) / this.state.slideWidth);
            }

            if (index <= slidesAfter - 1) {
                return ((this.state.slideWidth + this.props.cellSpacing) * (this.state.slideCount + index));
            }
        }

        return targetPosition;
    }

    /**
     * 格式化每个界面的样式
     * @param children
     */
    formatChildren(children) {
        let self = this;
        let positionValue = this.props.vertical ? this.getTweeningValue('top') : this.getTweeningValue('left');
        return React.Children.map(children, function (child, index) {
            return (
                <li
                    className={"slider-slide-"+index}
                    style={self.getSlideStyles(index, positionValue)}
                    key={index}
                >
                    {child}
                </li>
            );
        });
    }

    /**
     * 轮播图轮廓样式
     */
    getFrameStyles() {
        return {
            position: 'relative',
            display: 'block',
            overflow: this.props.frameOverflow,//当内容溢出元素框时发生的事情
            width:'100%',
            height: this.props.vertical ? '100%' : '100%',
            margin: this.props.framePadding,
            padding: 0,
            transform: 'translate3d(0, 0, 0)',
            WebkitTransform: 'translate3d(0, 0, 0)',
            msTransform: 'translate(0, 0)',
            boxSizing: 'border-box',
            MozBoxSizing: 'border-box',
        };
    }


}

/**
 * 设置属性类型检查
 * @type {{}}
 */
Carousel.propTypes = {

    afterSlide: PropTypes.func,
    /**
     * 是否开启自动轮播
     */
    autoplay: PropTypes.bool,
    autoplayInterval: PropTypes.number,
    beforeSlide: PropTypes.func,
    cellAlign: PropTypes.oneOf(['left', 'center', 'right']),
    cellSpacing: PropTypes.number,
    data: PropTypes.func,
    dragging: PropTypes.bool,
    easing: PropTypes.string,
    edgeEasing: PropTypes.string,
    framePadding: PropTypes.string,
    frameOverflow: PropTypes.string,
    initialSlideHeight: PropTypes.number,
    initialSlideWidth: PropTypes.number,
    slideIndex: PropTypes.number,
    slidesToShow: PropTypes.number,
    //PropTypes.oneOfType作用: 指定的多个对象类型中的一个
    slidesToScroll: PropTypes.oneOfType([
        PropTypes.number,
        //PropTypes.oneOf作用： 用 enum 来限制 prop 只接受指定的值
        PropTypes.oneOf(['auto']),
    ]),
    decorators:PropTypes.arrayOf(
        PropTypes.shape({
            component: PropTypes.func,
            style: PropTypes.object,
            position: PropTypes.oneOf([
                'TopLeft',
                'TopCenter',
                'TopRight',
                'CenterLeft',
                'CenterCenter',
                'CenterRight',
                'BottomLeft',
                'BottomCenter',
                'BottomRight',
            ])
        })
    ),
    slideWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    speed: PropTypes.number,
    swiping: PropTypes.bool,
    vertical: PropTypes.bool,
    width: PropTypes.string,
    wrapAround: PropTypes.bool,

}

/**
 * 设置属性的默认值
 * @type {{}}
 */
Carousel.defaultProps = {

    afterSlide: function () {
    },

    beforeSlide: function () {
    },
    data: function () {
    },

    autoplay: false,
    autoplayInterval: 3000,
    cellAlign: 'center',
    cellSpacing: 20, //单个图片之间的间距
    dragging: true,
    easing: 'easeOutCirc',
    edgeEasing: 'easeOutElastic',
    framePadding: '0px',//轮播图轮廓的内边距
    frameOverflow: 'hidden',//visible,scroll,auto,inherit
    slideIndex: 0,//轮播图开始加载时，初始化显示图片的下标
    slidesToScroll: 1,//一次滚动几张图片。1. 滚动一张  2. 滚动两张
    slidesToShow: 1, //一屏显示多张图片的步长
    slideWidth: 1,
    speed: 500,
    swiping: true,
    vertical: false,
    width: '100%',
    wrapAround: true, //是否开启循环播放
    // decorators:[{component: BottomCenterDecorator, style:{}, position: 'BottomCenter'}]
}


export default Carousel;