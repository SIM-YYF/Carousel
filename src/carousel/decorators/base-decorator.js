import React, {Component} from 'react';
import PropTypes from 'prop-types'

export  default  class BaseDecorator extends  Component{

    static propTypes = {
        currentSlide: PropTypes.number,
        slideCount : PropTypes.number,
        frameWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        slideWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        slidesToScroll: PropTypes.oneOfType([PropTypes.number, PropTypes.oneOf(['auto'])]),
        cellSpacing: PropTypes.number,
        slidesToShow: PropTypes.number,
        wrapAround: PropTypes.bool,
        nextSlide: PropTypes.func,
        previousSlide: PropTypes.func,
        goToSlide: PropTypes.func,
    }
    
    static defaultProps = {
        
    }
    
    
    constructor(props) {
      super(props);
    }

    renderBox(){

    }
    render(){
        return this.renderBox();

    }
    

}