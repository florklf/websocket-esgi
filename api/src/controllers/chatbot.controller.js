const { NlpManager } = require('node-nlp');
const fs = require('fs');
const path = require('path');


const onIntent = async (response, nextIntent) => {
    const output = response;
    const utterance = output.utterance.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
    const avaibility = ['01/02/2023', '02/02/2023', '03/02/2023', '04/02/2023', '05/02/2023'];

    if (nextIntent) {
        output.intent = nextIntent;
        output.nextIntent = null;
    }

    if (output.intent === 'vehicle_maintenance.check') {
        output.nextIntent = 'vehicle_maintenance.year';
    }
    else if (output.intent === 'vehicle_maintenance.year') {
        output.answer = `Très bien, quelle est l'année de votre véhicule ?`;
        const year = utterance.match(/(\d{4})/);
        if (year) {
            output.answer = `Très bien, quand a été effectué la dernière maintenance de votre véhicule ? (format : jj/mm/aaaa)`;
            output.nextIntent = 'vehicle_maintenance.last_maintenance';
        }
        else {
            output.answer = `Je n'ai pas compris l'année de votre véhicule.`;
            output.nextIntent = 'vehicle_maintenance.year';
        }
    }
    else if (output.intent === 'vehicle_maintenance.last_maintenance') {
        const date = utterance.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (date) {
            const lastMaintenance = new Date(date[3], date[2] - 1, date[1]);
            const today = new Date();
            const diffTime = Math.abs(today - lastMaintenance);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays > 365) {
                const weekAvaibility = false;
                output.answer = `Votre véhicule a été entretenu il y a plus d'un an.\n`;
                if (weekAvaibility) {
                    output.answer += ` Nous vous proposons de prendre rendez-vous pour le prochain entretien :`;
                }
                else {
                    output.answer += `Voici les disponibilités de la semaine prochaine :`;
                }
                output.items = avaibility;
                output.nextIntent = 'vehicle_maintenance.appointment';
            }
            else {
                output.answer = `Votre véhicule a été entretenu il y a moins d'un an. Combien de kilomètres avez-vous parcouru depuis ?`;
                output.nextIntent = 'vehicle_maintenance.km_since_last_maintenance';
            }
        } else {
            output.answer = `Je n'ai pas compris la date de votre dernier entretien.`;
            output.nextIntent = 'vehicle_maintenance.last_maintenance';
        }
    }
    else if (output.intent === 'vehicle_maintenance.ask_appointment') {
        const yesno = utterance.match(/(oui|non)/);
        if (yesno) {
            if (yesno[1] === 'oui') {
                output.answer = `Voici les disponibilités :`;
                output.items = avaibility;
                output.nextIntent = 'vehicle_maintenance.appointment';
            }
            else if (yesno[1] === 'non') {
                output.answer = `D'accord, je vous remercie de votre confiance. À bientôt !`;
                output.nextIntent = null;
            }
            else {
                output.answer = `Je n'ai pas compris votre réponse.`;
                output.nextIntent = 'vehicle_maintenance.ask_appointment';
            }
        }
        else {
            output.answer = `Je n'ai pas compris votre réponse.`;
            output.nextIntent = 'vehicle_maintenance.ask_appointment';
        }
    }
    else if (output.intent === 'vehicle_maintenance.appointment') {
        const date = utterance.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (date && avaibility.includes(`${date[1]}/${date[2]}/${date[3]}`)) {
            // Fake appointment creation
            output.answer = `Votre rendez-vous a bien été pris pour le ${date[1]}/${date[2]}/${date[3]}.\n`;
            output.answer += `Merci et à bientôt !`;
            output.nextIntent = null;
        } else {
            output.answer = `Je n'ai pas compris la date de votre rendez-vous.`;
            output.nextIntent = 'vehicle_maintenance.appointment';
        }
    }
    else if (output.intent === 'vehicle_maintenance.km_since_last_maintenance') {
        const km = utterance.match(/(\d+) ?(km|kilometres?)?/);
        if (km) {
            if (km[1] >= 10000) {
                output.answer = `Votre véhicule a parcouru plus de 10000 km depuis votre dernier entretien. Nous vous proposons de prendre rendez-vous pour le prochain entretien.`;
                output.items = avaibility;
                output.nextIntent = 'vehicle_maintenance.appointment';
            }
            else {
                output.answer = `Votre véhicule a parcouru moins de 10000 km depuis votre dernier entretien. Vouliez-vous prendre rendez-vous pour le prochain entretien ? (oui/non)`;
                output.nextIntent = 'vehicle_maintenance.ask_appointment';
            }
        }
        else {
            output.answer = `Je n'ai pas compris le nombre de kilomètres parcourus depuis votre dernier entretien.`;
            output.nextIntent = 'vehicle_maintenance.km_since_last_maintenance';
        }
    }
    else if (output.intent === 'vehicle_information.check') {
        const vehicleTypes = ['Usage routier', 'Usage tout-terrain', 'Usage sportif'];
        output.items = vehicleTypes;
        output.nextIntent = 'vehicle_information.type';
    }
    else if (output.intent === 'vehicle_information.type') {
        const vehicleType = utterance.match(/(usage routier|usage tout-terrain|usage sportif)/);
        if (vehicleType) {
            output.answer = `Que dites-vous d'un essai ${utterance} ?\n`;
            output.answer += `Voici les disponibilités :`;
            output.items = avaibility;
            output.nextIntent = 'vehicle_information.appointment';
        }
        else {
            output.answer = `Je n'ai pas compris le type de votre véhicule.`;
            output.nextIntent = 'vehicle_information.type';
        }
    }
    else if (output.intent === 'vehicle_information.appointment') {
        const date = utterance.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
        if (date && avaibility.includes(`${date[1]}/${date[2]}/${date[3]}`)) {
            // Fake appointment creation
            output.answer = `Votre rendez-vous a bien été pris pour le ${date[1]}/${date[2]}/${date[3]}.\n`;
            output.answer += `Merci et à bientôt !`;
            output.nextIntent = null;
        } else {
            output.answer = `Je n'ai pas compris la date de votre rendez-vous.`;
            output.nextIntent = 'vehicle_information.appointment';
        }
    }
    return output;
};

exports.chatbotConversation = async (req, res, next) => {
    const modelPath = path.join(__dirname, '../', 'model.nlp');
    const settings = {
        languages: ['fr'],
        autoSave: false,
        forceNER: false,
    }
    const manager = new NlpManager(settings);
    if (fs.existsSync(modelPath)) {
        manager.load(modelPath);
    }
    else {
        const corpusPath = path.join(__dirname, '../', 'corpus.json');
        manager.addCorpus(corpusPath);
        await manager.train();
        manager.save(modelPath, true);
    }
    const { data, nextIntent } = req.body;
    try {
        const message = data.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
        const response = await onIntent(await manager.process('fr', message), nextIntent);
        if (response.answer === undefined) {
            response.answer = 'Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ?';
        }
        res.status(200).json({
            answer: response.answer,
            items: response.items,
            nextIntent: response.nextIntent,
        });
    }
    catch (e) {
        console.log(e);
        res.status(401).json({ message: e.message });
    }
};