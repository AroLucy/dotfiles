/**
 * @name ColorTooltips
 * @version 0.0.2
 * @source https://github.com/Puv1s/ColorTooltips/blob/main/ColorTooltips.plugin.js
 * @updateUrl https://raw.githubusercontent.com/Puv1s/ColorTooltips/master/ColorTooltips.plugin.js
 */
/*@cc_on
@if (@_jscript)

	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
	var pathSelf = WScript.ScriptFullName;
	// Put the user at ease by addressing them in the first person
	shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();

@else@*/

module.exports = (() => {
    const config = {
        info:{
            name:"ColorTooltips",
            authors:[
                {
                    name:"Pu",
                    discord_id:"116242787980017679",
                    github_username:"Puv1s"
                }
            ],
            version:"0.0.2",
            description:"Highlights colors in chat with special popout",
            github:"https://github.com/Puv1s/ColorTooltips",
            github_raw:"https://raw.githubusercontent.com/Puv1s/ColorTooltips/master/ColorTooltips.plugin.js"
	    },

            main:"index.js"
        };

        const PluginCSS = 
        `
        .ColorTooltips-popout{
            width: 250px;
            height: 150px;
            background-color: var(--background-secondary);
            border-radius: 6px;
            overflow: hidden;
	    box-shadow: var(--elevation-high);
         }
        
        .ColorTooltips-header{
            display: flex;
            align-items: center;
            background-color: #202225;
            color: var(--text-normal);
            padding: 15px;
        }
        
        .ColorTooltips-headerItem {
            padding: 4px 7px;
            margin: 0px 5px;
            border: 1px solid var(--background-tertiary);
            border-radius: 4px;
            font-weight: 500;
            cursor: pointer;
        }
        
        .ColorTooltips-headerItem-selected{
            background-color: var(--background-primary);
        }

        .ColorTooltips-headerItem:hover:not(.ColorTooltips-headerItem-selected){
            background-color: var(--background-modifier-hover);
        }
        
        .ColorTooltips-copyButton {
            margin-left: auto;
            background-color: var(--background-primary);
            border-radius: 50%;
            width: 35px;
            height: 35px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        .ColorTooltips-copyButton:hover{
            background-color: var(--background-modifier-hover);
        }
        
        .ColorTooltips-container {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 10px;
        }
        
        .ColorTooltips-colorPreview {
            background-color: var(--currentColor);
            min-width: 60px;
            min-height: 60px;
            border-radius: 4px;
            margin-right: 10px;
        }
        
        .ColorTooltips-colorInfo {
            margin-left: 8px;
            height: 60px;
        }
        
        .ColorTooltips-title {
            text-transform: uppercase;
            font-size: 13px;
            margin-top: 3px;
            color: var(--channels-default);
            margin-bottom: 10px;
            font-weight: 600;
        }
        
        .ColorTooltips-colorInput {
            background-color: var(--activity-card-background);
            border: 1px solid transparent;
            border-radius: 4px;
            padding: 5px 8px;
            color: var(--interactive-active);
            width: 120px;
        }
        .ColorTooltips-colorInput:focus{
            border: 1px solid var(--brand-experiment);
        }
        `;

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: "Download Now",
                cancelText: "Cancel",
                onConfirm: () => {
                    require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                    });
                }
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Api) => {

    const {DiscordModules: {React, DiscordConstants, ReactDOM}, DiscordModules, WebpackModules, Patcher, PluginUtilities} = Api;

    const MessageComponent = WebpackModules.find(m => m.type?.displayName === "MessageContent");
    const Tooltip = WebpackModules.getByDisplayName("Tooltip");
    const Clickable = WebpackModules.getByDisplayName("Clickable");
    const Popout = BdApi.findModuleByDisplayName("Popout");

    const MessageStore = DiscordModules.MessageStore;
    const SelectedChannelStore = DiscordModules.SelectedChannelStore;


    class ColorPopout extends React.Component {
        state = {
            tab: ColorRegex.colorType(this.props.color), 
            color: this.props.color
        };

        colors = this.convertColor(this.props.color, this.state.tab);
    
        renderHeaderItem(name, id) {
            return React.createElement("div", {
                key: id,
                className: `ColorTooltips-headerItem${this.state.tab === id ? " ColorTooltips-headerItem-selected" : ""}`,
                onClick: () => this.setState({tab: id, color: this.colors[id]}) // maybe convert the color code.
            }, name);
        }
    
        renderBody() {
            return React.createElement("div", {
                className: "ColorTooltips-container",
                children: [
                    React.createElement("div", {
                        className: "ColorTooltips-colorPreview",
                        style: {
                            "--currentColor": this.state.color
                        }
                    }),
                    React.createElement("div", {
                        className: "ColorTooltips-colorInfo",
                        children: [
                            React.createElement("div", {
                                className: "ColorTooltips-title",
                            }, "Color Code"),

                            React.createElement("input", {
                                type: "text",
                                spellCheck: false,
                                value: this.state.color,
                                className: "ColorTooltips-colorInput"
                            })
                        ]
                    })
                ]
            });
        }

        

        convertColor(color, type){
            let convColor = color;

           switch(type){
            case "hex":
                break;

            case "rgb":
                convColor = ColorRegex.pSBC(0, color, "c");
                break;

            case "rgba":
                convColor = ColorRegex.RGBAToHex(color);
                break;
           } 
           return {
               hex:  (type == "hex") ? color : convColor,
               rgb:  (type == "rgb") ? color :ColorRegex.pSBC(0, convColor, "c"),
               rgba: (type == "rgba") ? color : ColorRegex.hexToRgbA(convColor)
           }
        }
    
        render() {
            return React.createElement("div", {
                className: "ColorTooltips-popout",
                children: [
                    React.createElement("div", {
                        className: "ColorTooltips-header",
                        children: [
                            this.renderHeaderItem("HEX", "hex"),
                            this.renderHeaderItem("RGB", "rgb"),
                            this.renderHeaderItem("RGBA", "rgba"),
                            React.createElement("div", {
                                className: "ColorTooltips-copyButton",
                                onClick: () => {
                                    ZLibrary.DiscordModules.ElectronModule.copy(this.state.color);
                                    BdApi.showToast("Color copied.", {timeout: 3000, type: 'success'});
                                },
                                children: React.createElement("svg", {
                                    height: 20,
                                    width: 20,
                                    viewBox: "0 0 24 24",
                                    fill: "currentColor",
                                }, React.createElement("path", {
                                    fill: "none",
                                    d: "M0 0h24v24H0z"
                                }), React.createElement("path", {
                                    d: "M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"
                                }))
                            })
                        ]
                    }),
                    React.createElement("div", {
                        className: "ColorTooltips-body",
                        children: this.renderBody()
                    })
                ]
            });
        }
    }

    class ColorRegex{
        //props to https://github.com/tiaanduplessis/colors-regex
        static reg = {
            hex: {
                strict: /^#([a-f0-9]{6}|[a-f0-9]{3})\b$/,
                global: /#([a-f0-9]{6}|[a-f0-9]{3})\b/ig
            },
            rgb: {
                strict: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
                global: /rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)/ig
            },
            rgba: {
                strict: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d*(?:\.\d+)?)\)$/,
                global: /rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*([1]{0,1}|[0](?:\.\d+)?)\)/ig
            }
        }

        static RGBAToHex(rgba) {
            let sep = rgba.indexOf(",") > -1 ? "," : " "; 
            rgba = rgba.substr(5).split(")")[0].split(sep);
                          
            // Strip the slash if using space-separated syntax
            if (rgba.indexOf("/") > -1)
              rgba.splice(3,1);
          
            for (let R in rgba) {
                let r = rgba[R];
                if (r.indexOf("%") > -1) {
                    let p = r.substr(0,r.length - 1) / 100;
                
                    if (R < 3) {
                        rgba[R] = Math.round(p * 255);
                    } else {
                        rgba[R] = p;
                    }
                }
            }

            let r = (+rgba[0]).toString(16),
            g = (+rgba[1]).toString(16),
            b = (+rgba[2]).toString(16)
      
            if (r.length == 1)
            r = "0" + r;
            if (g.length == 1)
            g = "0" + g;
            if (b.length == 1)
            b = "0" + b;

            return "#" + r + g + b;
        }

        static hexToRgbA(hex){
            var c;
            if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
                c= hex.substring(1).split('');
                if(c.length== 3){
                    c= [c[0], c[0], c[1], c[1], c[2], c[2]];
                }
                c= '0x'+c.join('');
                return 'rgba('+[(c>>16)&255, (c>>8)&255, c&255].join(',')+',1)';
            }
            throw new Error('Bad Hex');
        }

        static colorType(color){
            if(color.startsWith("#")) return "hex";
            if(color.startsWith("rgba")) return "rgba";
            if(color.startsWith("rgb")) return "rgb";
        }
        

        //props to Pimp Trizkit
        static pSBC=(p,c0,c1,l)=>{
            let r,g,b,P,f,t,h,i=parseInt,m=Math.round,a=typeof(c1)=="string";
            if(typeof(p)!="number"||p<-1||p>1||typeof(c0)!="string"||(c0[0]!='r'&&c0[0]!='#')||(c1&&!a))return null;
            if(!this.pSBCr)this.pSBCr=(d)=>{
                let n=d.length,x={};
                if(n>9){
                    [r,g,b,a]=d=d.split(","),n=d.length;
                    if(n<3||n>4)return null;
                    x.r=i(r[3]=="a"?r.slice(5):r.slice(4)),x.g=i(g),x.b=i(b),x.a=a?parseFloat(a):-1
                }else{
                    if(n==8||n==6||n<4)return null;
                    if(n<6)d="#"+d[1]+d[1]+d[2]+d[2]+d[3]+d[3]+(n>4?d[4]+d[4]:"");
                    d=i(d.slice(1),16);
                    if(n==9||n==5)x.r=d>>24&255,x.g=d>>16&255,x.b=d>>8&255,x.a=m((d&255)/0.255)/1000;
                    else x.r=d>>16,x.g=d>>8&255,x.b=d&255,x.a=-1
                }return x};
            h=c0.length>9,h=a?c1.length>9?true:c1=="c"?!h:false:h,f=this.pSBCr(c0),P=p<0,t=c1&&c1!="c"?this.pSBCr(c1):P?{r:0,g:0,b:0,a:-1}:{r:255,g:255,b:255,a:-1},p=P?p*-1:p,P=1-p;
            if(!f||!t)return null;
            if(l)r=m(P*f.r+p*t.r),g=m(P*f.g+p*t.g),b=m(P*f.b+p*t.b);
            else r=m((P*f.r**2+p*t.r**2)**0.5),g=m((P*f.g**2+p*t.g**2)**0.5),b=m((P*f.b**2+p*t.b**2)**0.5);
            a=f.a,t=t.a,f=a>=0||t>=0,a=f?a<0?t:t<0?a:a*P+t*p:0;
            if(h)return"rgb"+(f?"a(":"(")+r+","+g+","+b+(f?","+m(a*1000)/1000:"")+")";
            else return"#"+(4294967296+r*16777216+g*65536+b*256+(f?m(a*255):0)).toString(16).slice(1,f?undefined:-2)
        }

        //props to square for helping out with proper sorting
        static checkContent(content){
            const regexes = [
	              this.reg.hex.global,
		            this.reg.rgb.global,
		            this.reg.rgba.global,
            ]
            const matches = regexes.reduce((res, rx) => {
                    let match;
                    while (match = rx.exec(content)) {
                            res.push(match);
                    }
                    return res;
            }, []).sort((a, b) => {
                return a.index - b.index;
            });
            let res = [];
            let index = 0;
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                if (index < match.index) {
                    res.push(content.slice(index, match.index));
                }
                res.push(match);
                index = match.index + match[0].length;
            }
            if (index < content.length) {
                res.push(content.slice(index, content.length));
            }

            return res;
        }
    }

    return class ColorTooltips extends Plugin {

        async patchMessageContent(){
            Patcher.before(MessageComponent, "type", (e, t, n, r) => {
                let content = t[0].content;
                let newContent = [];
                for(var i = 0; i < content.length; i++){
                    if(!(typeof content[i] === 'string')) {
                        newContent.push(content[i]);
                        continue;
                    }
                    let found = ColorRegex.checkContent(content[i]);
                    if(!found.length) continue;
                    for(var j = 0; j < found.length; j++){
                        if(typeof found[j] === 'string') newContent.push(found[j]);
                        else{
                            newContent.push(this.createTooltip(found[j][0]))
                        }
                    }
                }
                t[0].content = newContent;
            });
        }

        forceUpdateMessages() {
            let c = SelectedChannelStore.getChannelId();
            if(!c) return;
            const messages = MessageStore.getMessages(c);
            if(!messages._array?.length) return;
            for(const message of messages._array) {
              DiscordModules.Dispatcher.dispatch({
                type: "MESSAGE_UPDATE",
                message: message
              });
            }
        }

        createTooltip(color){
            let hexColor = ColorRegex.pSBC(0, color, "c");
            let colorBg = ZLibrary.ColorConverter.rgbToAlpha(hexColor, 0.2);
            let colorFr = ZLibrary.ColorConverter.lightenColor(hexColor, 10);

            return React.createElement(Popout, {
                position: "top",
                align: "center",
                animation: "1",
                children: (function(tooltipProps) {
                    return React.createElement(Clickable, {
                        ...tooltipProps,
                        className: "wrapper-3WhCwL mention interactive",
                        role: "button",
                        tabIndex: 0,
                        tag: "span",
                        style: {
                            backgroundColor: colorBg,
                            color: colorFr
                        },
                        /*
                        onClick: () =>{
                            ZLibrary.DiscordModules.ElectronModule.copy(color);
                            window.open("https://maketintsandshades.com/" + hexColor, "_blank");
                        },
                        */
                        children: [
                            null,
                            [color]
                        ]
                    })
                }),
                renderPopout: () => {
                    return React.createElement(ColorPopout, {color: color});
                }
            });

            return React.createElement(Tooltip, {
                key: "colorTooltip",
                color: "primary",
                allowOverflow: false,
                disableTooltipPointerEvents: true,
                forceOpen: false,
                hideOnClick: false,
                position: "top",
                shouldShow: true,
                spacing: 8,
                text: [
                    React.createElement('div', {
                        className: "colorTooltip-text-item",
                        style: {
                            backgroundColor: hexColor
                            }
                        }
                    )
                ],
                children: (function(tooltipProps) {
                    return React.createElement(Clickable, {
                        ...tooltipProps,
                        className: "wrapper-3WhCwL mention interactive",
                        role: "button",
                        tabIndex: 0,
                        tag: "span",
                        style: {
                            backgroundColor: colorBg,
                            color: colorFr
                        },
                        onClick: () =>{
                            ZLibrary.DiscordModules.ElectronModule.copy(color);
                            //window.open("https://maketintsandshades.com/" + hexColor, "_blank");
                        },
                        children: [
                            null,
                            [color]
                        ]
                    })
                })
            });
        }

        async onStart() {
            PluginUtilities.addStyle(this.getName(), PluginCSS);
            this.patchMessageContent();
            this.forceUpdateMessages();
        }

        onStop() {
            PluginUtilities.removeStyle(this.getName());
            Patcher.unpatchAll();
        }

        onReload(){
            this.forceUpdateMessages();
        }

    };
};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
