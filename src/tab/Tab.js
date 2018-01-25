import React, {Component} from 'react';
// import {Tabs, WhiteSpace} from 'antd-mobile';
import styles from './Tab.css'
import {Tabs} from 'rmc-tabs'

const tabs = [
    {title: '1 Tab'},
    {title: '2 Tab'},
    {title: '3 Tab'},
];

class Tab extends Component {
    render() {
        return (
                <div className='page_context'>
                    <Tabs tabs={[
                        { title: 't1' },
                        { title: 't2' },
                        { title: 't3' },
                        { title: 't4' },
                        { title: 't5' },
                    ]} tabBarPosition="left" tabDirection="vertical"
                    >
                        <div key="t1"><p>content1</p></div>
                        <div key="t2"><p>content2</p></div>
                        <div key="t3"><p>content3</p></div>
                        <div key="t4"><p>content4</p></div>
                        <div key="t5"><p>content5</p></div>
                    </Tabs>
            </div>

        );
    }
}

export default Tab;
