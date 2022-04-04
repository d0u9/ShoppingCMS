const catIdKey = 'cat-id';
const prodIdKey = 'prod-id';
const HideTagSet = new Set(['News']);

function appendCategory(tag) {
    const li = $('<li></li>').addClass('cat-item').attr(catIdKey, tag.slug).html(tag.name);
    $('#category').append(li);
}

function setCategorySelected(slf) {
    const children = $('#category').children('li').each(function(i, item) {
        $(item).removeClass('cat-item-selected');
    });
    slf.addClass('cat-item-selected');
}

    api.tags.browse()
        .then((tags) => {
            const lis = [];
            tags.forEach((tag) => {
                if (!HideTagSet.has(tag.name)) {
                    appendCategory(tag)
                }
            });

            const selected = $('#category').children().first()
            const tagId = selected.attr(catIdKey);
            listCategory(tagId).then(() => {
                setCategorySelected(selected);
            });
    });

$('#category').on('click', '.cat-item', function() {
    const tagId = $(this).attr(catIdKey);
    listCategory(tagId).then(() => {
        setCategorySelected($(this));
    });
});

function listCategory(tagId) {
    const prodList = new Array();
    const promises = new Array();
    const filter = 'tag:' + tagId;
    return api.posts.browse({filter: filter})
        .then((posts) => {
            posts.forEach((post) => {
                promises.push(newProduct(post.id).then((post) => {
                    prodList.push(post);
                }));
            });
        })
        .then(() => {
            Promise.all(promises).then(() => {
                const con = $('#products-container');
                con.html('');
                prodList.forEach((item, i) => {
                    con.append(item);
                });
            });
        });
}

function newProduct(prodId) {
    return api.posts.read({id: prodId})
        .then((post) => {
            return createProdHTML(post);
        });
}

function createProdHTML(post) {
    const thumbnilImg = $('<img>').attr('src', post.feature_image);
    const thumbnil = $('<div></div>').addClass('thumbnil').append(thumbnilImg);

    const productName = $('<div></div>').addClass('product-name').html(post.title);
    const price = parseFloat(post.feature_image_caption);
    const productPrice = $('<div></div>').addClass('product-price').html(price.toFixed(2));
    const productHeader = $('<div></div>').addClass('product-header').attr(prodIdKey, post.id).append(productName).append(productPrice);
    var desc;
    if (post.excerpt === "") {
        desc = $('<div></div>').addClass('product-desc').html(post.html);
    } else {
        desc = $('<div></div>').addClass('product-desc').html(post.excerpt);
    }
    const detail = $('<div></div>').addClass('product-detail').append(productHeader).append(desc);

    const product = $('<div></div>').addClass('product').append(thumbnil).append(detail);
    return product
}

const Cart = new Map();

function calTotalPrice() {
    let totalPrice = 0.00;
    let amount = 0;
    Cart.forEach((value, key) => {
        totalPrice = totalPrice + parseFloat(value.price) * value.count;
        amount = amount + value.count;
    });

    $('#total-price').html(totalPrice.toFixed(2));
    $('#amount').html(amount);
}

$('#products-container').on('click', '.product-price', function() {
    const price = $(this).html();
    const name = $(this).parents('.product-header').children('.product-name').html();
    const category = $('.cat-item-selected').html();
    const id = $(this).parents('.product-header').attr(prodIdKey);
    const img = $(this).parents('.product').children('.thumbnil').children('img').attr('src');

    var cartItem;
    if (Cart.has(id)) {
        cartItem = Cart.get(id);
        cartItem.count += 1;
    } else {
        cartItem = {
            count: 1,
            img: img,
            category: category,
            name: name,
            price: parseFloat(price),
        };
    }

    console.log(id, cartItem);
    Cart.set(id, cartItem);
    calTotalPrice();
    refreshCart();

    var el = $(this);
    el.addClass('pulse-animation');
    newone = el.clone(true);
    el.before(newone);
    $(this).remove();
})

function newCartItem(item, id) {
    const img = $('<img>').attr('src', item.img);
    const thumbnil = $('<div></div>').addClass('thumbnil').append(img);

    const name = $('<div></div>').addClass('name').html(item.name);

    const price = $('<span></span>').addClass('price').addClass('rmb').html(item.price.toFixed(2));
    const amount = $('<span></span>').addClass('price-amount').html(item.count);
    const totalFloat = item.count * item.price;
    const total = $('<span></span>').addClass('price-total').addClass('rmb').html(totalFloat.toFixed(2));
    const priceCon = $('<div></div>').addClass('price-con')
                    .append(price).append(amount).append(total);

    const cat = $('<div></div>').addClass('cat').html('分类: ' + item.category);
    const ops = $('<div></div>').addClass('ops').attr(prodIdKey, id).html('删除');

    const footer = $('<div></div>').addClass('footer').append(cat).append(ops);
    const detail = $('<div></div>').addClass('detail')
                    .append(name)
                    .append(priceCon)
                    .append(footer);

    const listItem = $('<div></div>').addClass('item').append(thumbnil).append(detail);
    return listItem;
}

function refreshCart() {
    const cartList = $('#cart-list');
    cartList.html('');

    Cart.forEach((value, key) => {
        cartList.append(newCartItem(value, key));
    });
}

$('#cart-list').on('click', '.ops', function() {
    const prodId = $(this).attr(prodIdKey);
    if (!Cart.has(prodId)) {
        console.log('Big Bug');
    }

    item = Cart.get(prodId);
    if (item.count - 1 <= 0) {
        Cart.delete(prodId);
    } else {
        item.count = item.count - 1;
    }
    calTotalPrice();
    refreshCart();
})
