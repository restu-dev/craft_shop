document.addEventListener('alpine:init', () => {
    Alpine.data('products', () => ({
        items: [
            { id: 1, name: 'Produk Unggulan 1', img: 'product-unggulan.png', price: 2100 },
            { id: 2, name: 'Produk Unggulan 2', img: 'product-unggulan.png', price: 2200 },
            { id: 3, name: 'Produk Unggulan 3', img: 'product-unggulan.png', price: 2300 },
            { id: 4, name: 'Produk Unggulan 4', img: 'product-unggulan.png', price: 2400 },
            { id: 5, name: 'Produk Unggulan 5', img: 'product-unggulan.png', price: 2500 },
        ]
    }));

    Alpine.store('cart', {
        items: [],
        total: 0,
        quantity: 0,
        add(newItem) {

            // cek apakah ada barang yang sama dlm cart
            const cartItem = this.items.find((item) => item.id === newItem.id);

            // jika blm ada / cart masih kosong
            if (!cartItem) {
                this.items.push({ ...newItem, quantity: 1, total: newItem.price });
                this.quantity++;
                this.total += newItem.price;
            } else {
                // jika barang sudah ada, cek apakah barang beda atau sama dengan yang ada dicart
                this.items = this.items.map((item) => {
                    // jika barang berbeda
                    if (item.id !== newItem.id) {
                        return item;
                    } else {
                        // jika barang sudah ada, tambah quantity dan totalnya
                        item.quantity++;
                        item.total = item.price * item.quantity;
                        this.quantity++;
                        this.total += item.price;
                        return item;
                    }
                });
            }
        },
        remove(id) {
            // cek item yg akan di remve berdasarkan idnya
            const cartItem = this.items.find((item) => item.id === id);

            // jika item lebih dari 1
            if (cartItem.quantity > 1) {
                // telusuri satu satu
                this.items = this.items.map((item) => {
                    // jika bukan barang yang di klik
                    if (item.id !== id) {
                        return item;
                    } else {
                        item.quantity--;
                        item.total = item.price * item.quantity;
                        this.quantity--;
                        this.total -= item.price;
                        return item;
                    }
                })
            } else if (cartItem.quantity === 1) {
                // jika barangnya sisa 1
                this.items = this.items.filter((item) => item.id !== id);
                this.quantity--;
                this.total -= cartItem.price;

            }
        }

    });
});

// Form validation
const checkoutButton = document.querySelector('.checkoout-button');
checkoutButton.disabled = true;

const form = document.querySelector('#checkoutForm');

form.addEventListener('keyup', function () {

    for (let i = 0; i < form.elements.length; i++) {
        if (form.elements[i].value.length !== 0) {
            checkoutButton.classList.remove('disabled');
            checkoutButton.classList.add('disabled');
        } else {
            return false;
        }
    }

    checkoutButton.disabled = false;
    checkoutButton.classList.remove('disabled');
});

// kirim data ketika tombol checkout diklik
checkoutButton.addEventListener('click', async function (e) {
    e.preventDefault();

    const formData = new FormData(form);
    const data = new URLSearchParams(formData);
    const objData = Object.fromEntries(data);

    // const message = formatMessage(objData);
    // window.open('http://wa.me/6289669460382?text=' + encodeURIComponent(message));

    // minta transaction token mengunakan ajax / fetch
    try{
        const response = await fetch('php/placeOrder.php',{
            method:'POST',
            body:data
        });

        const token = await response.text();
        // console.log(token);
        window.snap.pay(token);
    }catch(err){
        console.log(err.message)
    }


});

// format pesan wa
const formatMessage = (obj) => {
    return `Data Customer
        Nama ${obj.name}
        Email ${obj.email}
        No HP ${obj.phone}
Data Pesanana
    ${JSON.parse(obj.items).map((item) => `${item.name}(${item.quantity} x ${rupiah(item.total)}) \n`)}
TOTAL: ${rupiah(obj.total)}
Terima kasih.`;
}


// konversi ke rupiah
const rupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
} 