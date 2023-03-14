(function() {
Vue.config.productionTip = false;

const bus = new Vue();

const Header = Vue.component('Header', {
    template: `
        <div class="header-container">标题</div>
    `
});

const Counter = Vue.component('Counter', {
    template: `
        <div class="number-container d-flex justify-content-center align-items-center">
            <button type="button" class="btn btn-light btn-sm" @click="sub">-</button>
            <span class="number-box">{{ num }}</span>
            <button type="button" class="btn btn-light btn-sm" @click="add">+</button>
        </div>
    `,
    props: {
        id: {
            required: true,
            type: Number
        },
        num: {
            default: 1,
            type: Number
        }
    },
    methods: {
        add() {
            const obj = { id: this.id, value: this.num + 1 };
            bus.$emit('share', obj);
        },
        sub() {
            if (this.num - 1 <= 0) {
                return;
            }

            const obj = { id: this.id, value: this.num - 1 };
            bus.$emit('share', obj);
        }
    }
});

const Goods = Vue.component('Goods', {
    template: `
        <div class="goods-container">
            <div class="thumb">
                <div class="custom-control custom-checkbox">
                    <input type="checkbox" class="custom-control-input" :id="'cb' + id" :checked="state" @change="stateChange" />
                    <label class="custom-control-label" :for="'cb' + id">
                        <img :src="image" alt="" />
                    </label>
                </div>
            </div>

            <div class="goods-info">
                <h6 class="goods-title">{{ title }}</h6>
                <div class="goods-info-buttom">
                    <span class="goods-price">￥{{ price }}</span>
                    <Counter :id="id" :num="count"></Counter>
                </div>
            </div>
        </div>
    `,
    props: {
        id: {
            require: true,
            type: Number
        },
        title: {
            default: '',
            type: String
        },
        count: {
            default: 1,
            type: Number
        },
        image: {
            default: '',
            type: String
        },
        price: {
            default: 0,
            type: Number
        },
        state: {
            default: true,
            type: Boolean
        }
    },
    methods: {
        stateChange(event) {
            const newState = event.target.checked;
            this.$emit('state-change', { id:this.id, value: newState });
        }
    },
    components: {
        Counter
    }
});

const Footer = Vue.component('Footer', {
    template: `
        <div class="footer-container">
            <div class="custom-control custom-checkbox">
                <input type="checkbox" class="custom-control-input" id="cbFull" :checked="isfull" @change="fullChange" />
                <label class="custom-control-label" for="cbFull">全选</label>
            </div>

            <div>
                <span>合计：</span>
                <span class="total-price">￥{{ totalprice.toFixed(2) }}</span>
            </div>

            <button type="button" class="btn btn-primary btn-settle">结算 ({{ totalcount }})</button>
        </div>
    `,
    props: {
        isfull: {
            default: true,
            type: Boolean
        },
        totalprice: {
            default: 0,
            type: Number
        },
        totalcount: {
            default: 0,
            type: Number
        }
    },
    methods: {
        fullChange(event) {
            this.$emit('full-change', event.target.checked);
        }
    }
});

const App = Vue.component('App', {
    template: `
        <div class="app-container">
            <Header></Header>

            <Goods 
                v-for="item in list" 
                :key="item.id" 
                :id="item.id" 
                :title="item.goods_name" 
                :count="item.goods_count" 
                :image="item.goods_img" 
                :price="item.goods_price" 
                :state="item.goods_state" 
                @state-change="getNewState"
            ></Goods>

            <Footer :isfull="fullState" :totalprice="totalPrice" :totalcount="totalCount" @full-change="getFullState"></Footer>
        </div>
    `,
    data() {
        return {
            list: []
        }
    },
    created() {
        this.initCartList();

        bus.$on('share', val => {
            this.list.some(item => {
                if (item.id === val.id) {
                    item.goods_count = val.value;
                    return true;
                }
            });
        });
    },
    methods: {
        async initCartList() {
            const {data: res} = await axios.get('http://localhost:8081/api/cart');
            if (res.status === 200) {
                this.list = res.list;
            }
        },
        getNewState(event) {
            this.list.some(item => {
                if (item.id === event.id) {
                    item.goods_state = event.value;
                    return true;
                }
            });
        },
        getFullState(val) {
            this.list.forEach(item => (item.goods_state = val));
        }
    },
    computed: {
        fullState() {
            return this.list.every(item => item.goods_state);
        },
        totalPrice() {
            return this.list
                .filter(item => item.goods_state)
                .reduce((total, item) => (total += item.goods_price * item.goods_count), 0);
        },
        totalCount() {
            return this.list
                .filter(item => item.goods_state)
                .reduce((total, item) => (total += item.goods_count), 0);
        }
    },
    components: {
        Header,
        Goods,
        Footer
    }
});

new Vue({
    render: h => h(App)
}).$mount('#app');

}) ();