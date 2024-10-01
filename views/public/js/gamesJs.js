
function goToDetails(id) {
    window.location.href = `/details/?id=${id}`
}

function viewGames() {
    let liveStream = document.getElementById('liveStream')
    liveStream.style.display = "block"
    const targetPosition = 800;
    window.scrollTo({
        top: targetPosition,
        behavior: "smooth"
    });
}

async function genreSearch(id) {
    let response = await fetch('/genreSearch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    if (response.status === 200) {
        location.reload()
    }
}

async function filterBy() {
    let filter = document.getElementById('filter').value
    if(filter === 'low' || filter === 'high' || filter === 'Z' || filter === 'A' || filter === 'relevance' || filter === 'popular' || filter === 'new' ) {
        let response = await fetch('/filter',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify({filter})
        })
        if(response.status === 200) {
            location.reload()
        }
    }
}


async function deleteFromWishlist(id, userId) {
    let response = await fetch('/wishRemove', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, userId })
    })
    if (response.status === 200) {
        document.getElementById('Cards_' + id).remove()
    } else if (response.status === 201) {
        window.location.href('/')
    } else if (response.status === 467) {
        window.location.href('/login')
    }
}


async function addtoCart(id, productId) {
    if (id === "") {
        await Swal.fire(
            'Please Login...!',
            'Sorry'
        )
        window.location.href = '/login'
    } else {
        let response = await fetch('/addtoCart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, productId })
        })
        if (response.status === 200) {
            document.getElementById('cartBtn').innerHTML = "Go to Cart"
            Swal.fire(
                'Added to Cart..!',
                'success'
            )
        } else if (response.status === 201) {
            window.location.href = '/cart'
        } else if (response.status === 467) {
            window.location.href = '/login'
        } else if (response.status === 202) {
            Swal.fire(
                'Cart Limit Reached..!',
                'Sorry...!'
            )
        }
    }
}

async function addtoCart2(id, productId) {
    if (id === "") {
        await Swal.fire(
            'Please Login...!',
            'Sorry'
        )
        window.location.href = '/login'
    } else {
        let response = await fetch('/addtoCart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, productId })
        })
        if (response.status === 200) {
            Swal.fire(
                'Added to Cart..!',
                'success'
            )
        } else if (response.status === 201) {
            window.location.href = '/cart'
        } else if (response.status === 467) {
            window.location.href = '/login'
        } else if (response.status === 202) {
            Swal.fire(
                'Cart Limit Reached..!',
                'Sorry...!'
            )
        }
    }
}

async function addtoWishlist(id, gameId) {
    if (id === "") {
        await Swal.fire(
            'Please Login...!',
            'Sorry'
        )
        window.location.href = '/login'
    } else {
        let response = await fetch('/wishlist', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, gameId })
        })
        if (response.status === 200) {
            document.getElementById('heartIcon').style.color = 'red'
            Swal.fire(
                'Game Added to Wishlist..!',
                'success'
            )
        } else if (response.status === 467) {
            window.location.href = '/login'
        } else if (response.status === 201) {
            document.getElementById('heartIcon').style.color = 'white'
            Swal.fire(
                'Game Removed from Wishlist',
                '!!!'
            )
        }
    }
}

async function pagination(page) {
    page = parseInt(page)*6
    const response = await fetch('/paginate',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({page})
    })
    if(response.status === 200) {
        window.location.href = '/games'
    }
}

async function quantity(productId, id, need, rate) {
    let response = await fetch('/quantity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, id, need })
    })
    if (response.status === 200) {
        let data = document.getElementById('quantitySpan_' + productId)
        let price = document.getElementById('price_' + productId)
        let priceValue = parseInt(price.innerHTML)
        let value = parseInt(data.innerHTML)
        value += 1
        priceValue += parseInt(rate)
        data.innerHTML = value
        price.innerHTML = priceValue
    } else if (response.status === 201) {
        let data = document.getElementById('quantitySpan_' + productId)
        let price = document.getElementById('price_' + productId)
        let priceValue = parseInt(price.innerHTML)
        let value = parseInt(data.innerHTML)
        value -= 1
        priceValue -= parseInt(rate)
        if (value === 0) {
            document.getElementById('item_' + productId).remove()
        } else if (value > 0) {
            data.innerHTML = value
            price.innerHTML = priceValue
        }
    } else if (response.status === 202) {
        Swal.fire(
            'Maximum Amount Reached..!',
            'Sorry...!'
        )
    }
}

async function buyNow(productId, id, quantity, need) {
    let response = await fetch('/buynow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, id, quantity, need })
    })
    if (response.status === 200) {
        window.location.href = '/checkout'
    } else {
        window.location.href = '/login'
    }
}

async function clearCart(id) {
    let response = await fetch('/clearCart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    if (response.status === 200) {
        window.location.href = '/cart'
    }
}

async function buyAll(id) {
    let response = await fetch('/buyall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
    })
    if (response.status === 200) {
        window.location.href = '/checkout'
    } else if (response.status === 201) {
        Swal.fire(
            'Product is Currently Unavailable..!',
            'Sorry...!'
        )
    }
}


async function couponSubmit(id, price) {
    let coupon = document.getElementById('coupon').value.trim()
    if (coupon != "") {
        console.log(coupon, id, price);
        let response = await fetch('/couponVerify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, coupon, price })
        })
        if (response.status === 200) {
            await Swal.fire(
                'Coupon verified!',
                'Discount recieved',
                'Success'
            )
            location.reload()
        } else if (response.status === 202) {
            Swal.fire(
                'Sorry Coupon Already Used',
                'Sorry'
            )
        } else if (response.status === 203) {
            Swal.fire(
                `Sorry Coupon is Valid from Specific Price`,
                'Sorry'
            )
        } else {
            Swal.fire(
                'No Coupon Found',
                'Sorry'
            )
        }
    }
}

async function orderNow(userId, amount, productId, quantity, need) {
    const types = document.getElementsByName('payment')
    let type = null
    for (const pay of types) {
        if (pay.checked) {
            type = pay.value
            break
        }
    }
    let response = await fetch('/orderNow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, productId, quantity, need, type })
    })
    if (response.status === 200) {
        let orderDetails = await response.json()
        await orderSuccess(userId, productId, orderDetails)
    } else if (response.status === 202) {
        $("#walletModal").modal("show");
    } else if (response.status === 203) {
        await Swal.fire('Error!', 'Insufficient balance', 'Sorry!');
        location.reload()
    } else if (afterPay.status === 467) {
        window.location.href = '/'
    } else {
        await Swal.fire('Order Failed!', 'Sorry for the inconvience', 'Sorry!');
        window.location.href = '/cart'
    }
}

async function orderSuccess(userId, productId, orderDetails) {
    var options = {
        "key": 'rzp_test_CEPS9ITcn3ts5D',
        "amount": orderDetails.order.amount,
        "currency": "INR",
        "name": "End Game Gaming",
        "description": "By Purchasing You Agree to Our Terms and Conditions",
        "image": "/img/logo.png",
        "order_id": orderDetails.order.id,
        "handler": async function (response) {
            console.log(response)
            await paymentDone(userId, productId, response, orderDetails)
        },
        "modal": {
            "ondismiss": async function () {
                let closed = await fetch('/closedWindow', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                })
                if (closed.status === 200) {
                    await Swal.fire('Payment cancelled!', 'Please Complete the Payment', 'Error');
                    location.reload()
                }
            }
        },
        "notes": {
            "address": "Endgame Gaming PVT LTD"
        },
        "theme": {
            "color": "#000"
        }
    };
    var rzp1 = new Razorpay(options);
    rzp1.on('payment.failed', async function (response) {
        await Swal.fire('Payment Failed!', 'Sorry for your Inconvenience', 'Error');
        window.location.href = '/cart'
    });
    rzp1.open();
}

async function walletPurchase(userId, amount, productId, quantity, need) {
    let response = await fetch('/walletPurchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, productId, quantity, need })
    })
    if (response.status === 200) {
        $(document).ready(function () {
            $("#walletModal").modal('hide');
        })
        await Swal.fire('Order Success!', 'Waiting for Confirmation', 'success');
        window.location.href = '/orders'
    } else {
        alert(response.status)
    }
}

async function paymentDone(userId, productId, response, orderDetails) {
    let afterPay = await fetch('/success', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response, userId, productId, orderDetails })
    })
    if (afterPay.status === 200) {
        await Swal.fire('Order Success!', 'Waiting for Confirmation', 'success');
        window.location.href = '/orders'
    } else if (afterPay.status === 467) {
        window.location.href = '/'
    } else {
        window.location.href = '/'
    }
}


function orderCancel() {
    document.getElementById('reason').style.display = 'block';
    document.getElementById('btnDiv').style.display = 'none';
}

function cancelReason() {
    document.getElementById('reason').style.display = 'none';
    document.getElementById('btnDiv').style.display = 'block';
}

async function Cancel(id) {
    let result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, cancel order!'
    });
    if (result.isConfirmed) {
        let reason = document.getElementById('reasonBox').value;
        let response = await fetch('/cancelOrder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, reason })
        });
        if (response.status === 200) {
            Swal.fire(
                'Sent!',
                'Your Order Cancel Request was Delivered Wait for Response.',
                'success'
            );
        } else {
            Swal.fire(
                'Sorry!',
                'Your order was already approved.',
                'sorry'
            );
        }
    } else {
        document.getElementById('reason').style.display = 'none';
        document.getElementById('btnDiv').style.display = 'block';
    }
}