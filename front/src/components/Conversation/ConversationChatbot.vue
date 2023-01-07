<script setup>
import { onBeforeMount, ref, computed } from 'vue';

const emit = defineEmits(['update:modelValue']);

const props = defineProps({
    modelValue: {
        type: Boolean,
        default: false,
    },
});

const model = computed({
    get: () => props.modelValue,
    set: (value) => emit('update:modelValue', value),
});

const messages = ref([]);
const chatbotInput = ref('');
const nextIntent = ref(null);

const closeChatbot = () => {
    model.value = false;
};

const scroll = (el, type, sec) => {
    setTimeout(() => {
        el.scrollTo({
            top: el.scrollHeight,
            behavior: type,
        });
    }, sec);
};

const sendMessage = (value, clicked) => {
    if (clicked) {
        messages.value = messages.value.map((message) => ({ ...message, clickable: false }));
    }
    const input = value ?? chatbotInput.value;
    if (input) {
        messages.value.push({
            id: messages.value.length,
            from: 'user',
            message: input,
        });
        chatbotInput.value = '';
        const messagesContainer = document.querySelector('.chatbot__body');
        scroll(messagesContainer, 'smooth', 100);
    }
    processWorkflow(input);
};

const processWorkflow = (input) => {
    let answer;
    let items;
    messages.value.push({
        id: messages.value.length,
        from: 'bot',
        message: 'Une seconde...',
        typing: true,
    });
    fetch('http://localhost:3000/api/chatbot/conversations', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            data: input,
            nextIntent: nextIntent.value,
        }),
    })
        .then((response) => response.json())
        .then((data) => {
            nextIntent.value = data.nextIntent;
            answer = data.answer.split('\n');
            if (data.items) {
                items = data.items;
            }
        })
        .catch(() => {
            answer = 'Une erreur est survenue.';
        })
        .finally(() => {
            messages.value[messages.value.length - 1].typing = false;
            answer.forEach((message, index) => {
                if (index !== 0) {
                    messages.value.push({
                        id: messages.value.length,
                        from: 'bot',
                        message,
                    });
                } else {
                    messages.value[messages.value.length - 1].message = message;
                }
            });
            if (items) {
                items.forEach((item) => {
                    messages.value.push({
                        id: messages.value.length,
                        from: 'bot',
                        message: item,
                        clickable: true,
                    });
                });
            }
        })
};

onBeforeMount(() => {
    messages.value.push({
        id: messages.value.length,
        from: 'bot',
        message: 'Bonjour, je suis Mobot, votre assistant personnel pour la maintenance de votre véhicule.',
    });
    messages.value.push({
        id: messages.value.length,
        from: 'bot',
        message: 'Que puis-je faire pour vous ?',
    });
});
</script>

<template>
    <div class="chatbot">
        <div class="chatbot__header">
            <div class="chatbot__header__title">
                <h3>Mobot, le chatbot</h3>
            </div>
            <div class="chatbot__header__close">
                <button @click="closeChatbot">
                    &#10006;
                </button>
            </div>
        </div>
        <div class="chatbot__body">
            <div class="chatbot__body__messages">
                <div class="chatbot__body__messages__message">
                    <div v-for="message in messages" :key="message.id" class="chatbot__body__messages__message__text"
                        :class="{ 'bg-green-400 ml-auto': message.from === 'user', 'bg-gray-200 mr-auto': message.from === 'bot', 'cursor-pointer bg-blue-100': message.clickable }">
                        <div v-if="message.from === 'bot' && message.typing">
                            <div class="chatbot__body__messages__message__text__typing">
                                <div class="chatbot__body__messages__message__text__typing__dot"></div>
                                <div class="chatbot__body__messages__message__text__typing__dot"></div>
                                <div class="chatbot__body__messages__message__text__typing__dot"></div>
                            </div>
                        </div>
                        <div v-else>
                            <span v-on="message.clickable ? { click: () => sendMessage(message.message, true) } : {}">
                                <span v-for="(text, index) in message.message.split(/(\S+@\S+\.\S+|\d{10})/g)"
                                    :key="index">
                                    <a v-if="text.match(/(\S+@\S+\.\S+|\d{10})/g)"
                                        :href="text.match(/(\S+@\S+\.\S+)/g) ? 'mailto:' + text : 'tel:33' + text.slice(1).replace(/\s/g, '')">
                                        {{ text }}
                                    </a>
                                    <span v-else>
                                        {{ text }}
                                    </span>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="chatbot__body__input">
                <input type="text" v-model.trim="chatbotInput" placeholder="Écrivez votre message..."
                    @keydown.enter="sendMessage()">
            </div>
        </div>
    </div>
</template>

<style scoped>
.chatbot {
    display: flex;
    flex-direction: column;
    position: fixed;
    bottom: 0;
    right: 30px;
    width: 500px;
    height: 600px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
    z-index: 100;
}

.chatbot__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 20px;
    border-bottom: 1px solid #eee;
}

.chatbot__header__title {
    font-size: 1.2rem;
}

.chatbot__header__close {
    font-size: 1.2rem;
}

.chatbot__body {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow-y: auto;
}

.chatbot__body__messages {
    flex: 1;
    padding: 20px;
}

.chatbot__body__messages__message {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
}

.chatbot__body__messages__message__text {
    border-radius: 10px;
    padding: 10px;
    margin-bottom: 1px;
}

.chatbot__body__input {
    padding: 10px 20px;

}

.chatbot__body__input input {
    width: 100%;
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 10px;
    outline: none;
}

.chatbot__body__input input::placeholder {
    color: #aaa;
}

.chatbot__body__input input:focus {
    border-color: #ccc;
}

.chatbot__body__input input:focus::placeholder {
    color: #ccc;
}

.chatbot__body__input input:disabled {
    background-color: #eee;
    border-color: #eee;
    color: #aaa;
    cursor: not-allowed;
}

.chatbot__body__messages__message__text__typing {
    display: flex;
    align-items: center;
    height: 17px;
}

.chatbot__body__messages__message__text__typing__dot {
    animation: typingAnimation 1.8s infinite ease-in-out;
    background-color: #c1c4c3;
    border-radius: 50%;
    height: 7px;
    margin-right: 4px;
    vertical-align: middle;
    width: 7px;
    display: inline-block;
}

.chatbot__body__messages__message__text__typing__dot:nth-child(1) {
    animation-delay: 200ms;
}

.chatbot__body__messages__message__text__typing__dot:nth-child(2) {
    animation-delay: 300ms;
}

.chatbot__body__messages__message__text__typing__dot:nth-child(3) {
    animation-delay: 400ms;
}

.chatbot__body__messages__message__text__typing__dot:last-child {
    margin-right: 0;
}

@keyframes typingAnimation {
    0% {
        transform: translateY(0px);
        background-color: #c1c4c3;
    }

    28% {
        transform: translateY(-5px);
        background-color: #acacac;
    }

    44% {
        transform: translateY(0px);
        background-color: #d4d7d6;
    }
}
</style>