<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Fraldas Ranny - O Jogo</title>
    <style>
        body { background: #000; color: white; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; overflow: hidden; touch-action: none; }
        canvas { border: 8px solid #34495e; max-width: 95vw; max-height: 95vh; touch-action: none; box-shadow: 0 10px 50px rgba(0,0,0,0.8); user-select: none; background: #2c3e50; }
        #joystickContainer { position: absolute; bottom: 10px; right: 40px; width: 120px; height: 120px; background: rgba(255,255,255,0.2); border-radius: 50%; border: 2px solid #fff; touch-action: none; display: block; z-index: 100; }
        #joystickKnob { position: absolute; top: 35px; left: 35px; width: 50px; height: 50px; background: #fff; border-radius: 50%; opacity: 0.8; pointer-events: none; }
        #telaFinal { background: rgb(71, 13, 28); padding: 30px; border-radius: 20px; text-align: center; z-index: 200; width: 85%; max-width: 400px; border: 2px solid #fff; display: none; position: absolute; }
        #btnComoChegar { background-color: #27ae60; color: white; padding: 15px; border: none; border-radius: 50px; font-size: 16px; font-weight: bold; cursor: pointer; width: 80%; margin-top: 15px; display: block; text-decoration: none; text-align: center; margin-left: auto; margin-right: auto; }
    </style>
</head>
<body>

<canvas id="gameCanvas"></canvas>
<div id="joystickContainer"><div id="joystickKnob"></div></div>

<div id="telaFinal">
    <h1>Fraldas Ranny</h1>
    <p>Parabéns! Você atendeu os clientes. <br> Visite nossa loja física</p>
    <a id="btnComoChegar" href="https://www.google.com/maps/dir/?api=1&destination=Estrada+do+Jaguaré+1706+São+Paulo" target="_blank">📍 Abrir no Google Maps</a>
    <button onclick="location.reload()" style="background:none; border:1px solid #fff; color:#fff; padding:10px; margin-top:15px; cursor:pointer; border-radius:10px; width: 80%; margin-left: auto; margin-right: auto;">Jogar Novamente</button>
</div>

<script>    
    const musicaFundo = new Audio('song.wav');
    musicaFundo.loop = true;
    let audioIniciado = false;

    function iniciarAudio() {
        if (!audioIniciado) {
            musicaFundo.play().then(() => { audioIniciado = true; }).catch(e => {});
        }
    }

    const canvas = document.getElementById("gameCanvas");
    const ctx = canvas.getContext("2d");
    const joystick = document.getElementById("joystickContainer");
    const knob = document.getElementById("joystickKnob");

    canvas.width = 800; canvas.height = 600;
    let estado = "JOGANDO", score = 0;
    const TOTAL_CLIENTES = 3; 

    const carregarImg = (src) => {
        const img = new Image();
        img.src = src;
        return img;
    };

    const imgFralda = carregarImg('Fraldas.png');
    const imgVendedor = carregarImg('vendedor.png');
    const imgBalcao = carregarImg('balcao.png');
    const imgEstoque = carregarImg('Estoque.png');
    const imgArara1 = carregarImg('arara-de-roupas-1.png');
    const imgArara2 = carregarImg('arara-de-roupas-2.png');
    const imgChao = carregarImg('piso_loja.png');
    const imgMao = carregarImg('mao.png');
    const imagensClientes = [carregarImg('cliente1.png'), carregarImg('cliente2.png'), carregarImg('cliente3.png')];
    
    let imgClienteAtual = imagensClientes[Math.floor(Math.random() * imagensClientes.length)]; 

    const estoque = { x: 20, y: 360, w: 280, h: 240 };
    const balcao = { x: 300, y: 170, w: 200, h: 130 };
    const arara1 = { x: 550, y: 400, w: 180, h: 180 }; 
    const arara2 = { x: 550, y: 300, w: 180, h: 180 }; 
    
    // OBSTÁCULOS (Áreas de colisão física)
    const colisaoEstoque = { x: 20, y: 490, w: 240, h: 10 };
    const colisaoBalcao = { x: 310, y: 250, w: 180, h: 10 };

    const vendedor = { x: 370, y: 80, w: 70, h: 100, speed: 6, carrying: false };
    let cliente = { x: 360, y: 650, w: 120, h: 150, status: "ENTRANDO", vel: 3 };

    let moveX = 0, moveY = 0, anguloMao = 0;
    const teclas = {};

    function sortearProximoCliente() {
        imgClienteAtual = imagensClientes[Math.floor(Math.random() * imagensClientes.length)];
    }

    function rectIntersect(x1, y1, w1, h1, x2, y2, w2, h2) {
        return x2 < x1 + w1 && x2 + w2 > x1 && y2 < y1 + h1 && y2 + h2 > y1;
    }

    window.addEventListener("keydown", e => { teclas[e.code] = true; iniciarAudio(); });
    window.addEventListener("keyup", e => teclas[e.code] = false);
    joystick.addEventListener("pointerdown", e => { joystick.setPointerCapture(e.pointerId); iniciarAudio(); updateJoystick(e); });
    joystick.addEventListener("pointermove", e => { if (joystick.hasPointerCapture(e.pointerId)) updateJoystick(e); });
    joystick.addEventListener("pointerup", () => { moveX = 0; moveY = 0; knob.style.transform = "translate(0,0)"; });

    function updateJoystick(e) {
        const rect = joystick.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2, centerY = rect.top + rect.height / 2;
        let dx = e.clientX - centerX, dy = e.clientY - centerY;
        const dist = Math.sqrt(dx * dx + dy * dy), max = rect.width / 2;
        if (dist > 0) { moveX = (dx / dist) * Math.min(dist / max, 1); moveY = (dy / dist) * Math.min(dist / max, 1); }
        knob.style.transform = `translate(${Math.cos(Math.atan2(dy, dx)) * Math.min(dist, max-15)}px, ${Math.sin(Math.atan2(dy, dx)) * Math.min(dist, max-15)}px)`;
    }

    function update() {
        if (estado !== "JOGANDO") return;
        
        let vx = ((teclas["ArrowRight"] || teclas["KeyD"] ? 1 : 0) - (teclas["ArrowLeft"] || teclas["KeyA"] ? 1 : 0) + moveX) * vendedor.speed;
        let vy = ((teclas["ArrowDown"] || teclas["KeyS"] ? 1 : 0) - (teclas["ArrowUp"] || teclas["KeyW"] ? 1 : 0) + moveY) * vendedor.speed;

        let px = vendedor.x + vx, py = vendedor.y + vy;

        if (!rectIntersect(px, vendedor.y, vendedor.w, vendedor.h, colisaoEstoque.x, colisaoEstoque.y, colisaoEstoque.w, colisaoEstoque.h) &&
            !rectIntersect(px, vendedor.y, vendedor.w, vendedor.h, colisaoBalcao.x, colisaoBalcao.y, colisaoBalcao.w, colisaoBalcao.h)) {
            vendedor.x = Math.max(0, Math.min(canvas.width - vendedor.w, px));
        }
        if (!rectIntersect(vendedor.x, py, vendedor.w, vendedor.h, colisaoEstoque.x, colisaoEstoque.y, colisaoEstoque.w, colisaoEstoque.h) &&
            !rectIntersect(vendedor.x, py, vendedor.w, vendedor.h, colisaoBalcao.x, colisaoBalcao.y, colisaoBalcao.w, colisaoBalcao.h)) {
            vendedor.y = Math.max(0, Math.min(canvas.height - vendedor.h, py));
        }

        // Lógica do Cliente
        if (cliente.status === "ENTRANDO") {
            cliente.y -= cliente.vel; 
            if (cliente.y <= 220) { cliente.y = 220; cliente.status = "ESPERANDO"; }
        } else if (cliente.status === "SAINDO") {
            cliente.y += cliente.vel + 2;
            if (cliente.y > 650) {
                if (score < TOTAL_CLIENTES) { cliente.y = 650; cliente.status = "ENTRANDO"; sortearProximoCliente(); }
                else { estado = "FIM"; musicaFundo.pause(); document.getElementById("telaFinal").style.display = "block"; }
            }
        }

        // GATILHO ESTOQUE (Só pega se tocar na imagem do estoque)
        if (!vendedor.carrying && rectIntersect(vendedor.x, vendedor.y, vendedor.w, vendedor.h, estoque.x, estoque.y, estoque.w, estoque.h)) {
            vendedor.carrying = true;
        }

        // GATILHO ENTREGA (CORRIGIDO: Área específica em frente ao balcão, longe do estoque)
        if (vendedor.carrying && cliente.status === "ESPERANDO") {
            // Vendedor precisa estar no meio da tela (balcão) e abaixo dele
            if (vendedor.x > 300 && vendedor.x < 500 && vendedor.y > 100 && vendedor.y < 170) {
                vendedor.carrying = false; cliente.status = "SAINDO"; score++;
            }
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (imgChao.complete) ctx.drawImage(imgChao, 0, 0, 800, 600);

        let objetos = [
            { img: imgEstoque, x: estoque.x, y: estoque.y, w: estoque.w, h: estoque.h, yBase: estoque.y + estoque.h },
            { img: imgBalcao, x: balcao.x, y: balcao.y, w: balcao.w, h: balcao.h, yBase: balcao.y + balcao.h },
            { img: imgArara1, x: arara1.x, y: arara1.y, w: arara1.w, h: arara1.h, yBase: arara1.y + arara1.h },
            { img: imgArara2, x: arara2.x, y: arara2.y, w: arara2.w, h: arara2.h, yBase: arara2.y + arara2.h },
            { img: imgVendedor, x: vendedor.x, y: vendedor.y, w: vendedor.w, h: vendedor.h, yBase: vendedor.y + vendedor.h, tipo: 'v' },
            { img: imgClienteAtual, x: cliente.x, y: cliente.y, w: cliente.w, h: cliente.h, yBase: cliente.y + cliente.h }
        ];

        objetos.sort((a, b) => a.yBase - b.yBase).forEach(obj => {
            if (obj.img.complete) {
                ctx.drawImage(obj.img, obj.x, obj.y, obj.w, obj.h);
                if (obj.tipo === 'v' && vendedor.carrying && imgFralda.complete) ctx.drawImage(imgFralda, vendedor.x + 10, vendedor.y + 40, 40, 30);
            }
        });

        if (cliente.status === "ESPERANDO") {
            const fx = cliente.x - 50, fy = cliente.y +30;
            ctx.fillStyle = "white"; ctx.beginPath(); ctx.roundRect(fx, fy, 200, 30, 10); ctx.fill();
            ctx.fillStyle = "black"; ctx.font = "bold 14px Arial"; ctx.fillText("Olá, quero fraldas, por favor!", fx + 10, fy + 20);

            anguloMao += 0.1; let flutuar = Math.sin(anguloMao) * 10;
            if (imgMao.complete) {
                if (!vendedor.carrying) ctx.drawImage(imgMao, estoque.x + 110, estoque.y - 50 + flutuar, 45, 45);
                else ctx.drawImage(imgMao, balcao.x + 75, balcao.y - 60 + flutuar, 45, 45);
            }
        }
        ctx.fillStyle = "white"; ctx.font = "bold 20px Arial";
        ctx.fillText("Atendidos: " + score + " / " + TOTAL_CLIENTES, 20, 40);
    }

    function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }
    gameLoop();
</script>
</body>
</html>
