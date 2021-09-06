# Plasma Active Application

KDE plasma applet to show the active application name. Thought to be used in a panel together with plasma's global menu.

## Motivation

Unfortunately [AWC](https://github.com/kotelnik/plasma-applet-active-window-control) does not seem to be maintained anymore. The experience from the official plasma global menu is currently better, but it is currently missing the active application name.

## Features

- Easy replacements through the configuration interface (see issue [#1](https://github.com/kupiqu/plasma-active-application/issues/1) for instructions)
- Maximaze/Restore (double-click) or close (middle-click)
- Full window title tooltip
- Configurable: Bold text, Show window icon, Spacing (Left, Right and in between of Icon and AppName), No window text (activity friendly), No window icon

## Preview

![d1](https://i.imgur.com/HSh6aHc.png)

## Installing

**Git:**

    git clone https://github.com/kupiqu/plasma-active-application
    plasmapkg2 -i .

[KDE Store](https://store.kde.org/p/1269296/)

## Updating

    plasmapkg2 -u .

## Uninstalling

    plasmapkg2 -r org.kde.activeApplication

## Credit where it is due

Strongly based on [AWC](https://github.com/kotelnik/plasma-applet-active-window-control)
