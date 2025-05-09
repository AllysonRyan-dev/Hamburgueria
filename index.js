const menu = document.getElementById("menu");
const cart_btn = document.getElementById("cart-btn");
const cart_modal = document.getElementById("cart-modal");
const cart_itens = document.getElementById("cart-items");
const cart_total = document.getElementById("total-cart");
const checkout_btn = document.getElementById("checkout-btn");
const close_modal_btn = document.getElementById("close-modal-btn");
const cart_count = document.getElementById("cart-count");
const address_input = document.getElementById("address");
const address_warn = document.getElementById("address-warn");
const restaurant_status = document.getElementById("date-span");

let cart = [];

// ABRIR O MODAL DO CARRINHO
cart_btn.addEventListener('click', function() {
  updateCart(); // Atualiza o carrinho ao abrir o modal
  cart_modal.style.display = "flex";
});

// Fechar o modal do carrinho clicando fora dele
cart_modal.addEventListener('click', event => {
  if (event.target === cart_modal) {
    cart_modal.style.display = "none";
  };
});

// Fechar o modal do carrinho clicando no botão de fechar
close_modal_btn.addEventListener('click', function() {
  cart_modal.style.display = "none"
});


// Saber qual item foi clicado, adicionando o evento de clique no menu
menu.addEventListener('click', function(event) {
  let parentButton = event.target.closest(".add-to-cart-btn");
  if(parentButton) {
    const name = parentButton.getAttribute("data-name");
    const price = parseFloat(parentButton.getAttribute("data-price"));
    // Adicionando o item ao carrinho
    addToCart(name, price);
  };
});

// Função para adicionar o item ao carrinho
function addToCart(name, price) {
  // Verificando se o item já existe no carrinho
  const existingItem = cart.find(item => item.name === name); // find retorna o primeiro item que satisfaz a condição
  if (existingItem) {
    existingItem.quantity += 1; // Se o item já existe, aumenta a quantidade
  } else {
    // Adiconando o item ao carrinho
    cart.push({ 
      name, 
      price, 
      quantity: 1 
    });
  }
  updateCart(); // Atualiza o carrinho
};

// Função para atualizar o carrinho
function updateCart() {
  cart_itens.innerHTML = ""; // Limpa o carrinho
  let total = 0; // Total do carrinho

  cart.forEach(item => {
    const cartItemElement = document.createElement("div");
    cartItemElement.classList.add("flex", "justify-between", "flex-col", "mb-4");
    cartItemElement.innerHTML = `
      <div class="flex justify-between items-center">
        <div>
        <p class="font-medium">${item.name}</p>
        <p>Qtd: ${item.quantity}</p>
        <p class="font-medium mt-2">${item.price.toLocaleString('pt-BR',{style: "currency", currency: "BRL"})}</p>
        </div>
        <button class="remove-from-cart-btn bg-red-500 text-white px-2 mt-1 rounded-full" data-name="${item.name}">
          Remover
        </button>
      </div>
    `;
    total += item.price * item.quantity; // Calcula o total do carrinho
    cart_itens.appendChild(cartItemElement); // Adiciona o item ao carrinho
  });

  cart_total.textContent = total.toLocaleString('pt-BR',
    {
      style: "currency",
      currency: "BRL"
    }
  ); // Atualiza o total do carrinho
  cart_count.innerHTML = cart.length; // Atualiza a quantidade de itens no carrinho
};

// Função para remover o item do carrinho
cart_itens.addEventListener('click', event => {
  if(event.target.classList.contains("remove-from-cart-btn")) {
    const name = event.target.getAttribute("data-name");
    removeItemCart(name); // Remove o item do carrinho
  };
});

function removeItemCart(name) {
  const index = cart.findIndex(item => item.name === name); // Encontra o índice do item no carrinho
  if (index !== -1) {
    const item = cart[index]; // Pega o item do carrinho
    if (item.quantity > 1) {
      item.quantity -= 1; // Diminui a quantidade do item
      updateCart(); // Atualiza o carrinho
      return;
    }
    cart.splice(index, 1); // Remove o item do carrinho
    updateCart(); // Atualiza o carrinho
  };
};

// Pegar o endereço do input e validar
address_input.addEventListener("input", event => {
  let inputValue = event.target.value;
  if (inputValue !== "") {
    address_warn.classList.add("hidden"); // Adiciona a classe hidden do aviso
    address_input.classList.remove("border-red-500"); // Remove a borda vermelha do input
  };
});

// Finalizar o pedido
checkout_btn.addEventListener("click", function() {
  const isOpen = checkRestaurante(); // Verifica se o restaurante está aberto
  if (!isOpen) {
    Toastify({
      text: "Ops! O restaurante está fechado!",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "rigth", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#ef4444",
      }
    }).showToast(); // Se o restaurante estiver fechado, mostra um aviso
  };
  if (cart.length === 0) {
    Toastify({
      text: "Ops! O carrinho está vazio!",
      duration: 3000,
      close: true,
      gravity: "top", // `top` or `bottom`
      position: "rigth", // `left`, `center` or `right`
      stopOnFocus: true, // Prevents dismissing of toast on hover
      style: {
        background: "#ef4444",
      }
    }).showToast();
    return; // Se o carrinho estiver vazio, não faz nada
  };
  if (address_input.value === "") {
    address_warn.classList.remove("hidden"); // Remove a classe hidden do aviso
    address_input.classList.add("border-red-500"); // Adiciona a borda vermelha ao input
  return;
  };

  // Enviar o pedido para api whatsapp
  const cartItens = cart.map((item) => {
    return (
      `${item.name} Quantidade: (${item.quantity}) Preço: ${item.price.toLocaleString('pt-BR', {style: "currency", currency: "BRL"})} | `
    )
  }).join("");

  const mensagem = encodeURIComponent(cartItens);
  const phone = "21984427268"

  window.open(`https://wa.me/${phone}?text=${mensagem} Endereço: ${address_input.value}`, "_blank"); // Abre o whatsapp com a mensagem
});

// Verifica se o restaurante está aberto
function checkRestaurante() {
  const data = new Date();
  const hora = data.getHours();
  return hora >= 18 && hora < 23; // O restaurante está aberto entre 18h e 23h
}

// Se o restaurante estiver fechado, o contorno do botão de checkout fica vermelho e o texto "Fechado" aparece
const restaurantOpen = checkRestaurante();
if (!restaurantOpen) {
  restaurant_status.classList.remove("bg-green-500");
  restaurant_status.classList.add("bg-red-500");
}