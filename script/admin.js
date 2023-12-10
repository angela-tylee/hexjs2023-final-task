let orderData = [];
const orderList = document.querySelector(".js-orderList");

function init(){
    getOrderList();
    renderC3_lv1();
    renderC3_lv2();
}

init();

// 取訂單資訊
function getOrderList(){
    axios.get(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,{
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        orderData = response.data.orders;
        let str = '';
        orderData.forEach(function(item){
            // 調整時間格式
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
            // 組產品字串
            let productStr = "";
            item.products.forEach(function(productItem){
                productStr += `<p>${productItem.title}</p>`
            })

        // 判斷訂單處理狀態
        let orderStatus = "";
        if(item.paid==true){
            orderStatus="已處理"
        } else {
            orderStatus="未處理"
        }
            str += `<tr>
                <td style="width: 15%">${item.id}</td>
                <td style="width: 10%">
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td style="width: 15%">${item.user.address}</td>
                <td style="width: 15%">${item.user.email}</td>
                <td style="width: 20%">
                    <p>${productStr}</p>
                </td>
                <td style="width: 10%">${orderTime}</td>
                <td style="width: 10%" class="js-orderStatus">
                    <a href="#" data-status="false" class="orderStatus"  data-id="${item.id}">${orderStatus}</a>
                </td>
                <td style="width: 5%">
                    <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                </td>
            </tr>`
        })
        orderList.innerHTML = str;
    })
}

// 點擊按鈕，刪除單筆訂單
orderList.addEventListener("click", function(e){
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    let id = e.target.getAttribute("data-id");
    if (targetClass == "delSingleOrder-Btn js-orderDelete") {
       deleteOrderItem(id);
       return; 
    }
    if (targetClass == "orderStatus"){
        let status = e.target.getAttribute("data-status");
        deleteOrderItem(status, id);
        return;
    }
})

// 更改訂單狀態
function changeOrderStatus(status, id){
    console.log(status,id);
    let newStatus;
    if(status==true){
        newStatus=false;
    } else {
        newStatus=true;
    };
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/`,{
        "data": {
            "id": id,
            "paid": newStatus,
          }
    },
    {
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        alert("修改訂單成功")
        getOrderList();
        renderC3_lv1();
        renderC3_lv2();
    })
}

// 刪除單筆訂單
function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders/${id}`,
    {
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        alert("刪除該筆訂單成功");
        getOrderList();
        renderC3_lv1();
        renderC3_lv2();
    })
}

// 刪除所有訂單
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/${api_path}/orders`,
    {
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        alert("刪除全部訂單成功！");
        getOrderList();
        renderC3_lv1();
        renderC3_lv2();
    })
    .catch(function(response){
        alert("訂單已經清空，請勿重複點擊");
    })
})

// 圖表 LV1：做圓餅圖，做全產品類別營收比重，類別含三項，共有：床架、收納、窗簾
function renderC3_lv1() {
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (obj[productItem.category] === undefined){
                obj[productItem.category] = productItem.quantity * productItem.price;
            } else {
                obj[productItem.category] += productItem.quantity * productItem.price;
            }
        })
    });
    console.log(obj);

    let originAry = Object.keys(obj);
    console.log(originAry);

    let categoryRankAry = [];

    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        categoryRankAry.push(ary);
    });

    console.log(categoryRankAry);

    let chart = c3.generate({
        bindto: '#chart-1', 
        data: {
            type: "pie",
            columns: categoryRankAry,
        },
        colors:{
            pattern: ["#DACBFF","#9D7FEA","#5434A7","#301E5F"]
        },
    });
}


// 圖表 LV2：做圓餅圖，做全品項營收比重，類別含四項，篩選出前三名營收品項，其他 4~8 名都統整為「其它」
function renderC3_lv2() {
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if (obj[productItem.title] === undefined){
                obj[productItem.title] = productItem.quantity * productItem.price;
            } else {
                obj[productItem.title] += productItem.quantity * productItem.price;
            }
        })
    });
    console.log(obj);

    let originAry = Object.keys(obj);
    console.log(originAry);

    let itemRankAry = [];

    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        itemRankAry.push(ary);
    });

    console.log(itemRankAry);

    itemRankAry.sort(function (a,b){
        return b[1] - a[1];
    })

    if (itemRankAry.length > 3){
        let otherTotal = 0;
        itemRankAry.forEach(function (item, index){
            if (index > 2){
                otherTotal += itemRankAry[index][1];
            }
        })
        itemRankAry.splice(3, itemRankAry.length - 1);
        itemRankAry.push(['其他', otherTotal]);
    }

    let chart = c3.generate({
        bindto: '#chart-2', 
        data: {
            type: "pie",
            columns: itemRankAry,
        },
        colors:{
            pattern: ["#DACBFF","#9D7FEA","#5434A7","#301E5F"]
        }
    });
}

renderC3_lv1();
renderC3_lv2();