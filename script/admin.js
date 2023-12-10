let orderData = [];
const orderList = document.querySelector(".js-orderList");

function init(){
    getOrderList();
}

init();

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
                <td>${item.id}</td>
                <td>
                    <p>${item.user.name}</p>
                    <p>${item.user.tel}</p>
                </td>
                <td>${item.user.address}</td>
                <td>${item.user.email}</td>
                <td>
                    <p>${productStr}</p>
                </td>
                <td>${item.createdAt}</td>
                <td class="js-orderStatus">
                    <a href="#" data-status="false" class="orderStatus"  data-id="${item.id}">${orderStatus}</a>
                </td>
                <td>
                    <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
                </td>
            </tr>`
        })
        orderList.innerHTML = str;
    })
}

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
    })
}

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
    })
}

// 圖表
function renderC3(){
    console.log(orderData);
    // 物件資料搜集
    let total = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(total[productItem.category]==undefined){
                total[productItem.category] = productItem.price * productItem.quantity;
            } else {

            }
        })
    })
    // C3.js
    let chart = c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: [
            ['Louvre 雙人床架', 1],
            ['Antony 雙人床架', 2],
            ['Anty 雙人床架', 3],
            ['其他', 4],
            ],
            colors:{
                "Louvre 雙人床架":"#DACBFF",
                "Antony 雙人床架":"#9D7FEA",
                "Anty 雙人床架": "#5434A7",
                "其他": "#301E5F",
            }
        },
    });
}
renderC3();

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

    let rankSortAry = [];

    originAry.forEach(function(item){
        let ary = [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });

    console.log(rankSortAry);

    rankSortAry.sort(function (a,b){
        return b[1] - a[1];
    })

    // 超過4筆，統整為其他
    if (rankSortAry.length > 3){
        let otherTotal = 0;
        rankSortAry.forEach(function (item, index){
            if (index > 2){
                otherTotal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3, rankSortAry.length - 1);
        rankSortAry.push(['其他', otherTotal]);
    }

    c3.generate({
        bindto: '#chart', // HTML 元素綁定
        data: {
            type: "pie",
            columns: rankSortAry,
        },
        colors:{
            pattern: ["#DACBFF","#9D7FEA","#5434A7","#301E5F"]
        }
    });
}

renderC3_lv2();