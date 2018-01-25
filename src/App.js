import React, {Component} from 'react';
import style from './App.css';
import Carousel from "./carousel/carousel";

import { Tabs, WhiteSpace } from 'antd-mobile';

const tabs = [
    { title: '1 Tab' },
    { title: '2 Tab' },
    { title: '3 Tab' },
];
class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            data: ['1', '2', '3'],
            imgHeight: '50%',
            slideIndex: 0,
        };


    }



    render() {

        return (



            <div style={{width:'100%', height:'100%', position: 'fixed', top: '0', left: '0'}}>


                {/*<Carousel style={{width: '100%', height:'100%',textAlign:'center',verticalAlign:'center'}}*/}
                          {/*autoplay={true}*/}
                          {/*vertical={true}*/}
                          {/*slideIndex={0}*/}
                          {/*cellSpacing={0}*/}
                          {/*slideWidth={0.95}*/}
                          {/*frameOverflow={'hidden'}*/}
                          {/*>*/}

                    {/*<div style={{width: '100%', height:'88%', backgroundColor: 'red'}}>*/}

                    {/*</div>*/}

                    {/*<div  style={{width: '100%', height:'88%', backgroundColor: 'green'}}>*/}
                    {/*</div>*/}

                    {/*<div  style={{width: '100%', height:'88%', backgroundColor: 'blue'}}>*/}
                    {/*</div>*/}

                {/*</Carousel>*/}


                {/*<div className='riangle-bottomright' />*/}
                {/*<div className='triangle-bottomright02' />*/}
                {/*<div className='jiao' />*/}






            </div>
        );
    }
}

export default App;
