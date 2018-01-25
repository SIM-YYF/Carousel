import React from 'react';
import BaseDecorator from './base-decorator'

/**
 * 构建指示点的装饰器
 */
export default  class BottomCenterDecorator extends BaseDecorator{

    constructor(props) {
      super(props);
      this.state = {
          slideCount: this.props.slideCount,//轮播图中的数量
          slidesToScroll: this.props.slidesToScroll,//一次滚动图片的数量
          currentSlide: this.props.currentSlide,//当前选中图片的索引
      };
    }

    componentWillReceiveProps(nextProps) {
        if(nextProps){
            this.setState({
                slideCount: this.props.slideCount,
                slidesToScroll: this.props.slidesToScroll,
                currentSlide: this.props.currentSlide,
            })
        }
    }

    /**
     * 列表样式
     */
    getListStyles(){
        return {
            position:'relative',
            margin: 0,
            top: -20,
            padding:0
        }
    }

    /**
     * 每个指示点的样式
     */
    getDotStyle(){
        return {
            listStyleType: 'none',
            display: 'inline-block',
        }
    }

    /**
     * 每个指示点button的样式
     */
    getDotButtonStyle(active){
        return {
            border:0,
            backgroundColor:'transparent',
            color:'black',
            cursor: 'pointer',
            padding:0,
            outline:0,
            fontSize:24,
            opacity: active ? 1 : 0.5,
        }
    }
    /**
     * 计算显示指示点的数组
     * @returns {Array}
     */
    getDotArray(){
        const dots = []
        for(let i=0; i < this.state.slideCount; i += this.state.slidesToScroll){
            dots.push(i);
        }
        
        return dots;
    }


    /**
     * 切换到下一页
     */
    goToSlide(index){
        this.props.goToSlide(index);
    }

    /**
     * 构建每个指示点的组件
     */
    getDotCommponet(index){
        return (
            <li key={index} style={this.getDotStyle()}>
                <button style={this.getDotButtonStyle(this.state.currentSlide === index)}>&bull;</button>
            </li>
        )
    }

    renderBox(){

        const _this = this

        const dotArray = this.getDotArray();


        return (
           <ul style={_this.getListStyles()}>

               {
                   //创建每个指示点
                   dotArray.map((index) =>(_this.getDotCommponet(index)))
               }
           </ul>
        )
    }
}