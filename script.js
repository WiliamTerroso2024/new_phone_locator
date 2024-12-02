// Configurações do sistema
const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0NjI2ODJmYzUwOTU0MzhhYTQwZTExNTJlNGMyNzI1YSIsImlhdCI6MTczMzA0ODQwNiwiZXhwIjoyMDQ4NDA4NDA2fQ.RWBpRa56-9Us3vfSTy18urtSSPZq7faWHgYmKaXaVj8";
const url = "http://206.42.5.159:8124/api/states/device_tracker.2312dra50g"; // ID do dispositivo atualizado

// Elemento onde o endereço será exibido
const addressElement = document.getElementById("device-address");

// Função para inicializar o mapa
let map;
let marker;

function initializeMap(latitude, longitude) {
    console.log("Inicializando mapa com as coordenadas:", latitude, longitude);
    map = L.map('map').setView([latitude, longitude], 13);

    // Adiciona o tileLayer do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Cria o marcador no mapa
    marker = L.marker([latitude, longitude]).addTo(map);
}

// Função para buscar a localização do dispositivo no Home Assistant
async function fetchDeviceLocation() {
    try {
        console.log("Iniciando a requisição para obter dados do dispositivo...");
        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        // Verifica se a resposta foi bem-sucedida
        if (!response.ok) {
            throw new Error("Erro ao obter os dados do dispositivo.");
        }

        const data = await response.json();
        console.log("Dados do dispositivo recebidos:", data);

        // Extrai latitude e longitude do dispositivo
        const latitude = data.attributes.latitude;
        const longitude = data.attributes.longitude;

        if (!latitude || !longitude) {
            throw new Error("Coordenadas não encontradas no dispositivo.");
        }

        // Faz uma consulta para obter o endereço via API de geocodificação (OpenStreetMap)
        const geocodeResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
        const geocodeData = await geocodeResponse.json();

        // Exibe o endereço completo na interface
        const address = geocodeData.display_name || "Endereço não disponível.";
        addressElement.textContent = `Endereço do dispositivo: ${address}`;

        // Inicializa o mapa com a posição do dispositivo
        initializeMap(latitude, longitude);

        // Atualiza a posição do marcador caso o mapa já tenha sido carregado
        if (marker) {
            marker.setLatLng([latitude, longitude]);
            map.setView([latitude, longitude], 13);
        }

    } catch (error) {
        // Em caso de erro, exibe uma mensagem
        console.error("Erro ao carregar a localização:", error);
        addressElement.textContent = "Erro ao carregar o endereço do dispositivo.";
    }
}

// Executa a função ao carregar a página
fetchDeviceLocation();
