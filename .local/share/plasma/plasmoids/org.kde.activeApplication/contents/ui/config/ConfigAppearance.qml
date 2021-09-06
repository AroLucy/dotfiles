import QtQuick 2.2
import QtQuick.Controls 1.3
import QtQuick.Layouts 1.1
import org.kde.plasma.core 2.0 as PlasmaCore

Item {
    id: appearancePage

    property alias cfg_boldFontWeight: boldFontWeight.checked
    property alias cfg_showWindowIcon: showWindowIcon.checked
    property alias cfg_leftSpacing: leftSpacing.value
    property alias cfg_iconAppNameSpacing: iconAppNameSpacing.value
    property alias cfg_rightSpacing: rightSpacing.value
    property alias cfg_titleReplacements: titleReplacements.text

    property alias cfg_noWindowText: noWindowText.text
    property string cfg_noWindowIcon: plasmoid.configuration.noWindowIcon

    GridLayout {
        columns: 2

        Layout.columnSpan: 2

        Label {
            text: i18n('Plasmoid version: ') + '0.2'
            Layout.columnSpan: 2
        }

        Item {
            width: 2
            height: 15
            Layout.columnSpan: 2
        }

        GridLayout {
            columns: 2

            Layout.columnSpan: 2

            CheckBox {
                id: boldFontWeight
                text: i18n("Bold text")
                Layout.columnSpan: 2
            }

            CheckBox {
                id: showWindowIcon
                text: i18n("Show window icon")
                Layout.columnSpan: 2
            }

            Label {
                text: i18n("Spacing (Left/Icon-AppName/Right):")
            }
            Row {
                spacing: 50
                SpinBox {
                    id: leftSpacing
                    decimals: 1
                    stepSize: 0.5
                    minimumValue: 0
                    maximumValue: 50
                }
                SpinBox {
                    id: iconAppNameSpacing
                    decimals: 1
                    stepSize: 0.5
                    minimumValue: 0
                    maximumValue: 50
                }
                SpinBox {
                    id: rightSpacing
                    decimals: 1
                    stepSize: 0.5
                    minimumValue: 0
                    maximumValue: 50
                }
            }

            Item {
                width: 2
                height: 15
                Layout.columnSpan: 2
            }

            Label {
                    text: i18n('Replacements:\nuse newline or ";" as delimiter')
                    wrapMode: Text.Wrap
            }

            TextArea {
                    id: titleReplacements
                    text: '".* Firefox", "Firefox";\n".* Chromium", "Chromium";\n"Google ", "";\n " Player", "";\n"Gimp.*", "Gimp";\n'
                    onTextChanged: cfg_titleReplacements = text
                    Layout.preferredWidth: 400
            }

            Item {
                width: 2
                height: 15
                Layout.columnSpan: 2
            }

            Label {
                text: i18n('No window text:\nuse %activity% for activity name')
                wrapMode: Text.Wrap
            }
            TextField {
                id: noWindowText
                placeholderText: 'KDE :: Plasma Desktop @ %activity%'
                onTextChanged: cfg_noWindowText = text
                Layout.preferredWidth: 400
            }

            Label {
                text: i18n("No window icon:")
            }
            IconPicker {
                currentIcon: cfg_noWindowIcon
                defaultIcon: ''
                onIconChanged: cfg_noWindowIcon = iconName
            }
        }
    }

}
