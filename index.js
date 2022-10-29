const listaMangas = document.getElementById("titulos-lista");
const contenedor = document.getElementById("contenedor");
const footer = document.getElementById("footer");
const totalCompra = document.getElementById("total");
const btnMostrarCarrito = document.getElementById("btn-carrito");
const abrirContenedorCarrito = document.getElementById("contenedor-carrito");
const contadorCarrito = document.getElementById("contador-carrito");

const mangasVendidos = document.getElementById("mangas-vendidos");
const listaVentas = document.getElementById("ver-ventas");


//CARGAR AL LOCAL STORAGE
const cargarMangasJSON = async () => {
    let response = await fetch("./mangas.json");
    let mangas = await response.json();
    localStorage.setItem("mangasGuardados", JSON.stringify(mangas));
}

const cargarListaMangasJSON = () => {
    let mangasGuardados = cargarDelLS();
    let mangasLista = mangasGuardados.reduce(function (titulosProd, productos) {
        return Array.from(new Set([...titulosProd, productos.titulo]))
    }, []);
    localStorage.setItem("mangasLista", JSON.stringify(mangasLista));
}


//FUNCION PARA TRAER DEL LOCAL STORAGE
const cargarDelLS = () => {
    let mangasLS = JSON.parse(localStorage.getItem("mangasGuardados"));
    return mangasLS;
}

const cargarListaDelLS = () => {
    let mangasLista = JSON.parse(localStorage.getItem("mangasLista"))
    return mangasLista;
}


//PAGINA PRINCIPAL (LISTA DE TITULOS Y MANGAS POR TITULO)
const imprimirLista = () => {
    let mangasLista = cargarListaDelLS();
    let fragmentLista = '';
    let nombre = '';
    let manga = '';
    mangasLista.forEach(titulo => {
        manga = titulo;
        nombre = titulo.toLowerCase().split(' ').join('');
        fragmentLista += `
        <div id="mostrar-lista" class="mostrar-lista" onclick="mostrarProd('${manga}')">
        <h3 class="titulo-manga">${manga}</h3>
        <img class="imagen-lista" src="Mangas/${nombre}portada.jpg">
        </div>`
    })
    listaMangas.innerHTML = fragmentLista;
}

const volverALista = () => {
    contenedor.innerHTML = "";
    footer.innerHTML = "";
    imprimirLista();
}

const mostrarProd = (prod) => {
    let mangasLS = JSON.parse(localStorage.getItem("mangasGuardados"));
    let mangasGuardados = mangasLS.filter(item => item.titulo === prod);
    mangasGuardados.forEach(producto => {
        let {id, titulo, autor, marca, precio, stock, img} = producto;
        const div = document.createElement(`div`);  
        let agregar = `<button class="btn-agregar-prod" id="agregar-prod", onclick="agregarProducto(${id})"><div id="icono"><i class="bi bi-cart-plus"></i></div> <div>Agregar al carrito</div></button>
        </div>
        `;
        let sinStock = `<p><b>Sin Stock</b></p>
        </div>
        `;
        let divHTML = `
        <div class="mostrar-productos">
        <div class="div-imagen">
        <img class="imagen-manga" src="${img}">
        </div>
        <h3 class="titulo-manga">"${titulo}"</h3>
        <p>Autor: ${autor}<br>
        Editorial: ${marca} <br>
        Precio: <b>$${precio}</b></p>`;
        stock > 0 ? divHTML +=agregar : divHTML +=sinStock;
        div.innerHTML +=divHTML;
        contenedor.append(div);
    });
    const volver = document.createElement('div')
    let verLista = `
    <div class="div-ver-lista" ><button id="ver-lista" class="btn-ver-lista" onclick="volverALista()">Volver a la lista</button></div>`;
    listaMangas.innerHTML = "";
    volver.innerHTML += verLista;
    footer.append(volver);
}


//COMPROBAR EL LOCAL STORAGE O TRAER ARCHIVO JSON
if(!localStorage.getItem("mangasGuardados")){
    cargarMangasJSON()
    .then(cargarListaMangasJSON)
    .then(imprimirLista)
    .catch(error => {
        console.log("no se carga");
    })
}else{
    imprimirLista();
}


//CARRITO DE COMPRAS
let carrito = [];

let guardarCarrito = () => {
    localStorage.setItem("carritoStorage", JSON.stringify(carrito));
}

let eliminarProdCarrito = (id) => {
    carrito[id].cantidad--;
    carrito[id].cantidad === 0 && carrito.splice(id, 1);
    guardarCarrito();
    desplegarCarrito();
};

let vaciarCarritoConfirmar = () => {
    Swal.fire({
        title: 'Vaciar el Carrito',
        text: "Está seguro que desea vaciar el carrito?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Vaciar!'
    }).then((result) => {
        if (result.isConfirmed) {
            Swal.fire(
                'Carrito vacio',
                'Los productos se borraron correctamente',
                'success'
                )
                carrito = [];
                guardarCarrito();
                esconderCarrito();
                contador();
        }
      })
    }
    
let calcularTotal = () => {
        let total = 0;
        carrito.forEach(prod => {
            let {precio, cantidad} = prod;
            total += precio * cantidad;
        });
        return total;
    };
    
//BUSCAR PRODUCTOS CARGADOS ANTERIORMENTE
let carritoStorage = JSON.parse(localStorage.getItem("carritoStorage"));
    
if(carritoStorage){
    carrito = carritoStorage;
}
    
//AGREGAR PRODUCTOS AL CARRITO DE COMPRAS
let mensajeError = (titulo) => {
    Swal.fire({
        icon: 'error',
        title: 'Limite de stock',
        text: `Su pedido supera la cantidad disponible de: "${titulo}"`,
    })
}
    
const agregarProducto = (id) => {
    Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: 'Producto agregado al carrito',
        showConfirmButton: false,
        timer: 1500
    })
    let mangasGuardados = cargarDelLS();
    let producto = mangasGuardados.find((producto) => producto.id === id);
    let productoEnCarrito = carrito.find((producto) => producto.id === id);
    if (productoEnCarrito){
        if (productoEnCarrito.cantidad < mangasGuardados[id-1].stock){
            carrito.forEach((producto) => {
                if(producto.id === id){
                    producto.cantidad++;
                } 
            })
        }else{
            mensajeError(producto.titulo);
        } 
    } else {
    producto.cantidad = 1
    carrito.push(producto);
    }
    guardarCarrito();
    desplegarCarrito();
    contador();
    esconderCarrito();
} 


//REALIZAR LA COMPRA(DISMINUYE LA CANTIDAD DE STOCK DEL LOCAL STORAGE)

let realizarCompra = () => {
    if(carrito.length !== 0){
        Swal.fire({
            position: 'center',
            icon: 'success',
            title: 'Gracias por su compra!',
            showConfirmButton: false,
            timer: 1500
        });
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'El carritio está vacío!',
        })
    }
    
    let mangasGuardados = cargarDelLS();
    for(const prod of carrito){
        let pos = prod.id - 1;
        mangasGuardados[pos].stock -= prod.cantidad;
        mangasGuardados[pos].cantidadVendida ? mangasGuardados[pos].cantidadVendida += prod.cantidad : mangasGuardados[pos].cantidadVendida = prod.cantidad;
    }
    localStorage.setItem("mangasGuardados", JSON.stringify(mangasGuardados));
    carrito=[];
    guardarCarrito();
    contador();
    esconderCarrito();
};


//MOSTRAR EL CARRITO EN PANTALLA
const esconderCarrito = () => {
    abrirContenedorCarrito.innerHTML = "";
}

const desplegarCarrito = () => {
    abrirContenedorCarrito.innerHTML = "";
    const div = document.createElement(`div`);
    let ventanaCarrito = `            
    <div id="div-carrito" class="carrito-compras">
    <h2 class="carrito-titulo"><i class="bi bi-cart"></i> Carrito</h2>
    <button id="btn-esconder-carrito" class="btn-esconder-carrito" onclick="esconderCarrito()"><i class="bi bi-box-arrow-up"></i></button>            
        <ul id="carrito" class="lista">`;
        
    ventanaCarrito += renderizarCarrito();
    
    ventanaCarrito +=`</ul>
        <hr />
        <p class="total">Total: $<span id="total">`;
    
    if (carrito != []) {ventanaCarrito += calcularTotal()}

    ventanaCarrito += `</span></p>
        <button id="boton-vaciar" class="btn-carrito-evc" onclick="vaciarCarritoConfirmar()">Vaciar carrito <i class="bi bi-cart-x"></i></button>
        <button id="realizar-compra" class="btn-carrito-evc" onclick="realizarCompra()">Comprar <i class="bi bi-cart-check"></i></button>
    </div>`
    div.innerHTML = ventanaCarrito;
    abrirContenedorCarrito.append(div);
}

btnMostrarCarrito.addEventListener('click', desplegarCarrito);

let renderizarCarrito = () =>{
    let carritoHTML = "";
    carrito.forEach((prod, id) => {
        let {titulo, precio, cantidad, tomo} = prod;
        carritoHTML += `
        <div class="prod-en-carrito">
            <p>"${titulo}"<br>
            Tomo: ${tomo}<br>
            Cantidad: <b>${cantidad}</b><br>
            Precio: <span id="total">$${precio}</span></p>
            <button class="btn-carrito-evc" onclick="eliminarProdCarrito(${id})">Eliminar<i class="bi bi-cart-dash"></i></button><br><br>
        </div>            
        `
    });
    contador();
    return carritoHTML;
}

const contador = () => {
    if(carrito != ''){
        let cant = 0;
        carrito.forEach(manga => {
            cant += manga.cantidad;
        });
        contadorCarrito.innerHTML = `<div>${cant}</div>`;
    }else{
        contadorCarrito.innerHTML = '';
    }
}

contador();


//VER VENTAS REALIZADAS
let cerrarListaVentas = () => {
    listaVentas.innerHTML = "";
}

let verVentas = () => {
    const table = document.createElement(`div`);
    let ventasTotales = 0;
    let recaudadoFinal = 0;
    let mangasGuardados = cargarDelLS();
    let tablaHTML = `<div class="lista-ventas"><table id="tabla">
    <tr>
    <th class="columnas">Titulo</th>
    <th class="columnas">Cantidad vendida</th>
    <th class="columnas">Total recaudado</th>
    </tr>`
    for (const producto of mangasGuardados) {
        if(producto.cantidadVendida>0){
            let totalRecaudado = producto.precio * producto.cantidadVendida;
            ventasTotales += producto.cantidadVendida;
            recaudadoFinal += totalRecaudado;
            let fila = `<tr><td>"${producto.titulo}" Tomo: ${producto.tomo}</td><td class="fila">${producto.cantidadVendida}</td><td class="fila">$${totalRecaudado}</td></tr>`;
            tablaHTML += fila;
        }
    }
    tablaHTML += `<tr><td>Cantidad Total</td><td class="fila">${ventasTotales}</td><td class="fila">$${recaudadoFinal}</td></tr>
    </table>`
    let botonCerrar = `<div class="div-cerrar-ventas"><button class="btn-cerrar-ventas" id="cerrar" onclick="cerrarListaVentas()">Cerrar</button></div></div>`;
    tablaHTML += botonCerrar;
    listaVentas.append(table);
    listaVentas.innerHTML = tablaHTML;
}

mangasVendidos.addEventListener("click", verVentas);