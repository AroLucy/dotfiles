/*
 * Copyright 2018  avlas <jsardid@gmail.com> (based on Kotalnik and Broulik
 * work)
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License as
 * published by the Free Software Foundation; either version 2 of
 * the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http: //www.gnu.org/licenses/>.
 */

import QtQuick 2.2
import QtQuick.Layouts 1.1
import org.kde.plasma.plasmoid 2.0
import org.kde.plasma.core 2.0 as PlasmaCore
import org.kde.plasma.components 2.0 as PlasmaComponents
import org.kde.taskmanager 0.1 as TaskManager
import org.kde.activities 0.1 as Activities
import org.kde.plasma.private.appmenu 1.0 as AppMenuPrivate

Item {
    id: main

    property bool windowActive: false
    property bool mouseHover: false
    property var activeTaskLocal: null
    property string tooltipText: ''

    anchors.fill: parent
    anchors.left:  parent.left

    Layout.fillWidth: false
    Layout.minimumWidth: activeWindow.width
    Layout.maximumWidth: activeWindow.width

    Plasmoid.preferredRepresentation: Plasmoid.fullRepresentation

    //TasksModel
    TaskManager.TasksModel {
        id: tasksModel

        onActiveTaskChanged: {
            updateActiveWindowInfo()
        }
        onDataChanged: {
            updateActiveWindowInfo()
        }
        onCountChanged: {
            updateActiveWindowInfo()
        }
    }

    //AppMenuModel (focus state)
    AppMenuPrivate.AppMenuModel {
        id: appMenuModel
    }

    TaskManager.ActivityInfo {
        id: activityInfo

        onCurrentActivityChanged: {
            updateActiveWindowInfo();
        }
    }

    Activities.ActivityModel {
        id: activityModel
    }

    function activeTask() {
        return activeTaskLocal
    }

    function activeTaskExists() {
        return activeTask().display !== undefined || activeTask().appName !== undefined
    }

    function toggleMaximized() {
        tasksModel.requestToggleMaximized(tasksModel.activeTask);
    }

    function toggleMinimized() {
        tasksModel.requestToggleMinimized(tasksModel.activeTask);
    }

    function toggleClose() {
        tasksModel.requestClose(tasksModel.activeTask);
    }

    function updateTooltip() {
        tooltipText = activeTask().display || ''
    }

    function composeNoWindowText() {
        return plasmoid.configuration.noWindowText.replace('%activity%', activityInfo.activityName(activityInfo.currentActivity))
    }

    function updateActiveWindowInfo() {

        var activeTaskIndex = tasksModel.activeTask

        var abstractTasksModel = TaskManager.AbstractTasksModel
        var isActive = abstractTasksModel.IsActive

        if (!tasksModel.data(activeTaskIndex, isActive)) {
            activeTaskLocal = {}
        } else {
            activeTaskLocal = {
                appName: tasksModel.data(activeTaskIndex, abstractTasksModel.AppName),
                display: tasksModel.data(activeTaskIndex, Qt.DisplayRole),
                decoration: tasksModel.data(activeTaskIndex, Qt.DecorationRole),
            }
        }

        var actTask = activeTask()
        windowActive = activeTaskExists()
        if (windowActive) {
            activeWindowName.text = fineTuning(actTask.appName)
            iconItem.source = actTask.decoration
        } else if (!appMenuModel.menuAvailable || activeWindowName.text === "") {
            activeWindowName.text = composeNoWindowText()
            iconItem.source = plasmoid.configuration.noWindowIcon
        }
        updateTooltip()
    }

    // active window info
    Item {
        id: activeWindow

        anchors.top: parent.top
        anchors.bottom: parent.bottom
        anchors.left: parent.left

        anchors.leftMargin: plasmoid.configuration.leftSpacing
        anchors.rightMargin: plasmoid.configuration.rightSpacing

        width: plasmoid.configuration.showWindowIcon ? anchors.leftMargin + iconItem.width + plasmoid.configuration.iconAppNameSpacing + activeWindowName.width + anchors.rightMargin : anchors.leftMargin + activeWindowName.width + anchors.rightMargin

        Item {
            height: main.height

            // window icon
            PlasmaCore.IconItem {
                id: iconItem

                anchors.left: parent.left
                height: parent.height

                source: plasmoid.configuration.noWindowIcon
                visible: plasmoid.configuration.showWindowIcon
            }

            // window title
            PlasmaComponents.Label {
                id: activeWindowName

                anchors.left: parent.left
                anchors.leftMargin: plasmoid.configuration.showWindowIcon ? iconItem.width + plasmoid.configuration.iconAppNameSpacing : 0
                anchors.top: parent.top
                anchors.bottom: parent.bottom
                height: parent.height
                text: updateActiveWindowInfo()
                wrapMode: Text.NoWrap
                elide: Text.ElideNone
                font.weight: plasmoid.configuration.boldFontWeight ? Font.Bold : theme.defaultFont.weight
            }
        }
    }

    function fineTuning(title) {

        var replacements = plasmoid.configuration.titleReplacements;

        replacements = replacements.replace(/\n/g, ";");
        replacements = replacements.replace(/;;/g, ";");
        replacements = replacements.replace(/; | ;/g, ";");
        replacements = replacements.replace(/, | ,/g, ",");

        var appReplacements = replacements.split(";");

        for (var iReplacement = 0; iReplacement < appReplacements.length; iReplacement++){

            if (appReplacements[iReplacement].length > 0) {

                appReplacements[iReplacement] = appReplacements[iReplacement].replace(/"/g, "");

                var repText = appReplacements[iReplacement].split(",");

                var regEx = new RegExp(repText[0], "ig"); //case insensitive
                title = title.replace(regEx,repText[1]);
            }

        }
        return title;
    }

    MouseArea {
        anchors.fill: parent

        acceptedButtons: Qt.LeftButton | Qt.MiddleButton

        onClicked: {
            if (mouse.button == Qt.MiddleButton) {
                toggleClose()
            }
        }

        onDoubleClicked: {
            // if (mouse.button == Qt.LeftButton) {
            //     toggleMinimized()
            // }
            if (mouse.button == Qt.LeftButton) {
                toggleMaximized()
            }
        }

        hoverEnabled: true

        onEntered: {
            mouseHover = true
        }

        onExited: {
            mouseHover = false
        }

        PlasmaCore.ToolTipArea {

            anchors.fill: parent

            active: tooltipText !== ''
            interactive: true
            location: plasmoid.location

            mainItem: Row {

                spacing: 0

                Layout.minimumWidth: fullText.width + units.largeSpacing
                Layout.minimumHeight: childrenRect.height
                Layout.maximumWidth: Layout.minimumWidth
                Layout.maximumHeight: Layout.minimumHeight

                Item {
                    width: units.largeSpacing / 2
                    height: 2
                }

                PlasmaComponents.Label {
                    id: fullText
                    text: tooltipText
                }
            }
        }
    }
}
