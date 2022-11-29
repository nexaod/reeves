import * as config from '../../config.json';
import { EmbedBuilder, ChatInputCommandInteraction, Interaction } from 'discord.js';
import Bot from '../Bot';

export default interface UtilityHandler {
    client: Bot;
    config: typeof config;
    random(array: Array<any>): Array<number>;
    loadingEmbed: EmbedBuilder;
    loadingText: string;
}

interface Channels {
    [channelName: string]: string;
}

interface Roles {
    [roleName: string]: string;
}

export default class UtilityHandler {
    constructor(client: Bot) {
        this.client = client;
        this.config = config;
        this.random = (array) => array[Math.floor(Math.random() * array.length)];
        this.deleteMessage = this.deleteMessage;
        this.loadingEmbed = new EmbedBuilder().setAuthor({ name: 'Loading...' });
        this.loadingText = '<a:Typing:598682375303593985> **Loading...**';
    }

    get colours() {
        return {
            green: 2067276,
            aqua: 1146986,
            blue: 2123412,
            red: 10038562,
            lightgrey: 10070709,
            gold: 12745742,
            default: 5198940,
            lightblue: 302332,
            darkgrey: 333333,
            discord: {
                green: 5763719,
                red: 15548997
            }
        }
    }

    get channels(): Channels {
        if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
            return {
                leaderboard: '1024897631715069962',
                applyForRank: '1025418108711731240',
                performanceExpectations: '1024896851436122145',
                additionalInfo: '1024897391549227038',
                readingConfirmation: '1025994029290238032',
                rules: '1024896890648666112',
                ranks: '1025998858397945946',
                bot: '1026531701591122061',
                gear: '1025998799635755079',
                magicGuide: '1024897854692659221',
                rangedGuide: '1024897871046262844',
                changelog: '1030320969325215766',
                hybridGuide: '1024897901819871272',
                otherGuide: '1032888041104216084',
                botGuide: '1033224923734356018',
                streamers: '1033768665633525850',
                gemScores: '1034480950198927380',
                trialLog: '1034481085700116561',
                applications: '1041468135074697298',
                trialSignup: '1041475525673222278'
            }
        }
        return {
            leaderboard: '1027065926283186206',
            applyForRank: '742114134400958589',
            performanceExpectations: '1027052084455014421',
            additionalInfo: '1027049057031565373',
            readingConfirmation: '1025994029290238032',
            rules: '1027051461919658045',
            ranks: '1027051628311892009',
            bot: '742114134400958591',
            gear: '1027051656367591474',
            magicGuide: '1027115254091620393',
            rangedGuide: '1027115278204669962',
            changelog: '1029912967074033755',
            hybridGuide: '1027115316783886367',
            otherGuide: '1032887045351293040',
            botGuide: '1029912020608356452',
            streamers: '742114133796847681',
            gemScores: '1004273622971584594',
            trialLog: '1004273661659840522',
            applications: '1004299323871334440',
            trialSignup: '1004252528554283078'
        }
    }

    get roles(): Roles {
        if (process.env.ENVIRONMENT === 'DEVELOPMENT') {
            return {
                mainTrialHost: '<@&1024973897621315584>',
                extreme: '<@&1024979670766194738>',
                adept: '<@&1026506909945172069>',
                mastery: '<@&1026380140655153163>',
                meleeEnt: '<@&1025444893931352084>',
                meleeUmbra: '<@&1025444129951449128>',
                rangedEnt: '<@&1025639306045435904>',
                rangedUmbra: '<@&1025639254300299434>',
                magicEnt: '<@&1025676489770926081>',
                magicEntAdept: '<@&1026370030943883345>',
                magicEntMastery: '<@&1026370099671740537>',
                magicEntExtreme: '<@&1026370194161020968>',
                ironman: '<@&1025996624318705747>',
                cdar: '<@&1026002395060248576>',
                chinner: '<@&1026002430405660712>',
                meleeFree: '<@&1026002457303732257>',
                organiser: '<@&1026018780305948732>',
                coOwner: '<@&1026018856952668160>',
                applicationTeam: '<@&1026018904704831590>',
                trialTeam: '<@&1026018931288313936>',
                readyForTrial: '<@&1026018741852586096>',
                magicFreeMastery: '<@&1026377160052711434>',
                magicFreeExtreme: '<@&1026377263689764955>',
                magicBase: '<@&1026378978077970452>',
                magicBaseAdept: '<@&1026379013897338920>',
                magicBaseMastery: '<@&1026379061976649798>',
                magicBaseExtreme: '<@&1026379088266543127>',
                rangedEntAdept: '<@&1026390072305655831>',
                rangedEntMastery: '<@&1026390214148624394>',
                rangedEntExtreme: '<@&1026390222881169448>',
                chinnerAdept: '<@&1026390384865194006>',
                chinnerMastery: '<@&1026390532483715073>',
                chinnerExtreme: '<@&1026390539454664735>',
                rangedFreeMastery: '<@&1026390687140282449>',
                rangedFreeExtreme: '<@&1026390737903964200>',
                mrEnt: '<@&1026391709816455278>',
                mrEntAdept: '<@&1026489564191260816>',
                mrEntMastery: '<@&1026489881079337010>',
                mrEntExtreme: '<@&1026489882664763422>',
                mrFreeMastery: '<@&1026489885835657347>',
                mrFreeExtreme: '<@&1026490072297635860>',
                mrBase: '<@&1026490160365437079>',
                mrHammer: '<@&1026490379920482354>',
                mrHammerAdept: '<@&1026490417958629476>',
                mrHammerMastery: '<@&1026490421985161346>',
                mrHammerExtreme: '<@&1026490425781010462>',
                meleeEntAdept: '<@&1026501791690543205>',
                meleeEntMastery: '<@&1026501870656684164>',
                meleeEntExtreme: '<@&1026501900075544597>',
                meleeFreeAdept: '<@&1026502001812582481>',
                meleeFreeMastery: '<@&1026502005692309534>',
                meleeFreeExtreme: '<@&1026502009244876930>',
                archAngel: '<@&1026506250713833482>',
                aodMaster: '<@&1026506320699998209>',
                deathDestroyer: '<@&1026506366753448088>',
                ofThePraesul: '<@&1026510296484954164>',
                truePraesul: '<@&1026510296577212576>',
                streamer: '<@&1026510377015578664>',
                t1AoD: '<@&1026519292390412288>',
                t2AoD: '<@&1026519390553915432>',
                t3AoD: '<@&1026519427899998248>',
                t4AoD: '<@&1026519440147349524>',
                aodFanatic: '<@&1026519503724617769>',
                angelSlayer: '<@&1026519507621130310>',
                member: '<@&1026696194224824351>',
                magicFree: '<@&1036604467807801374>',
                rangedFree: '<@&1036604481120505856>',
                mrFree: '<@&1036605223684280321>'
            }
        }
        return {
            mainTrialHost: '<@&742114133419491395>',
            extreme: '<@&742114133293400244>',
            adept: '<@&1026506909945172069>',
            mastery: '<@&1004490584267968673>',
            meleeEnt: '<@&742114133184610327>',
            meleeUmbra: '<@&742114133184610329>',
            rangedEnt: '<@&753695750084362344>',
            rangedUmbra: '<@&830948896771538964>',
            magicEnt: '<@&742114133184610331>',
            magicEntAdept: '<@&742114133184610332>',
            magicEntMastery: '<@&742114133293400238>',
            magicEntExtreme: '<@&742114133385937036>',
            ironman: '<@&1021940132938522644>',
            cdar: '<@&742114133154988155>',
            chinner: '<@&742114133154988156>',
            meleeFree: '<@&742114133154988158>',
            organiser: '<@&742114133419491396>',
            coOwner: '<@&742114133419491397>',
            applicationTeam: '<@&742114133201387564>',
            trialTeam: '<@&742114133201387563>',
            readyForTrial: '<@&1004269143547187230>',
            magicFreeMastery: '<@&896143975969333289>',
            magicFreeExtreme: '<@&896144166688555008>',
            magicBase: '<@&742114133184610324>',
            magicBaseAdept: '<@&742114133184610325>',
            magicBaseMastery: '<@&742114133293400240>',
            magicBaseExtreme: '<@&742114133385937035>',
            rangedEntAdept: '<@&834981107316949032>',
            rangedEntMastery: '<@&804514651684864010>',
            rangedEntExtreme: '<@&802363763931873281>',
            chinnerAdept: '<@&742114133154988157>',
            chinnerMastery: '<@&742114133293400242>',
            chinnerExtreme: '<@&742114133385937033>',
            rangedFreeMastery: '<@&864510428579233812>',
            rangedFreeExtreme: '<@&864510710414573612>',
            mrEnt: '<@&1023347425282363515>',
            mrEntAdept: '<@&1004493329196666961>',
            mrEntMastery: '<@&1024414967593717852>',
            mrEntExtreme: '<@&1024415189162000466>',
            mrFreeMastery: '<@&1024415063706173500>',
            mrFreeExtreme: '<@&1024415223337197588>',
            mrBase: '<@&1024419806948110418>',
            mrHammer: '<@&1023347697584963596>',
            mrHammerAdept: '<@&1024410676300627968>',
            mrHammerMastery: '<@&1024415099613626509>',
            mrHammerExtreme: '<@&1024415276000878652>',
            meleeEntAdept: '<@&742114133184610328>',
            meleeEntMastery: '<@&742114133293400241>',
            meleeEntExtreme: '<@&742114133385937034>',
            meleeFreeAdept: '<@&742114133154988159>',
            meleeFreeMastery: '<@&742114133293400237>',
            meleeFreeExtreme: '<@&742114133385937031>',
            archAngel: '<@&742114133385937037>',
            aodMaster: '<@&742114133419491389>',
            deathDestroyer: '<@&742114133419491390>',
            ofThePraesul: '<@&742114133201387567>',
            truePraesul: '<@&742114133201387568>',
            streamer: '<@&742114133201387569>',
            t1AoD: '<@&818499760205594634>',
            t2AoD: '<@&818499667276333056>',
            t3AoD: '<@&818499303999799368>',
            t4AoD: '<@&818499185166909442>',
            aodFanatic: '<@&818499016576073748>',
            angelSlayer: '<@&818498816923009035>',
            member: '<@&742114133201387565>',
            magicFree: '<@&896143035044343828>',
            rangedFree: '<@&864510172952002581>',
            mrFree: '<@&1024416642970701986>'
        }
    }

    get trialRoleOptions(): Roles {
        return {
            'Magic Entangle': 'magicEnt',
            'Magic Base': 'magicBase',
            'Ranged Entangle': 'rangedEnt',
            'Chinner': 'chinner',
            'Melee Entangle': 'meleeEnt',
            'Magic/Ranged Entangle': 'mrEnt',
            'Magic/Ranged Hammer': 'mrHammer',
            'Magic/Ranged Base': 'mrBase'
        }
    }

    public stripRole = (role: string) => {
        return role.slice(3, -1)
    }

    public hasRolePermissions = async (client: Bot, roleList: string[], interaction: Interaction) => {
        if (!interaction.inCachedGuild()) return;
        const validRoleIds = roleList.map((key) => this.stripRole(this.roles[key]));
        const user = await interaction.guild.members.fetch(interaction.user.id);
        const userRoles = user.roles.cache.map((role) => role.id);
        const intersection = validRoleIds.filter((roleId) => userRoles.includes(roleId));
        return intersection.length > 0;
    }

    public deleteMessage(interaction: ChatInputCommandInteraction<any>, id: string) {
        return interaction.channel?.messages.fetch(id).then((message) => message.delete());
    }

    public removeArrayIndex(array: Array<any>, indexID: number): any[] {
        return array.filter((_: any, index) => index != indexID - 1);
    }

    public checkURL(string: string): boolean {
        try {
            new URL(string);
            return true;
        } catch (error) {
            return false;
        }
    }

    public trim(string: string, max: number): string {
        return string.length > max ? string.slice(0, max) : string;
    }

    public convertMS(ms: number | null): string {
        if (!ms) return 'n/a';
        let seconds = (ms / 1000).toFixed(1),
            minutes = (ms / (1000 * 60)).toFixed(1),
            hours = (ms / (1000 * 60 * 60)).toFixed(1),
            days = (ms / (1000 * 60 * 60 * 24)).toFixed(1);
        if (Number(seconds) < 60) return seconds + ' Sec';
        else if (Number(minutes) < 60) return minutes + ' Min';
        else if (Number(hours) < 24) return hours + ' Hrs';
        else return days + ' Days';
    }

    public convertBytes(bytes: number): string {
        const MB = Math.floor((bytes / 1024 / 1024) % 1000);
        const GB = Math.floor(bytes / 1024 / 1024 / 1024);
        if (MB >= 1000) return `${GB.toFixed(1)} GB`;
        else return `${Math.round(MB)} MB`;
    }
}
