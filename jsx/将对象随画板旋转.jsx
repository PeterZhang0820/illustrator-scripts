// 将对象随画板旋转.jsx 适用于Ai。
// 秒数: 用来90度旋转画板上所有对象的脚本。
// 要求: Ai CS 6 及以上。
// 日期: 2018年10月。
// 作者: Alexander Ladygin, email: i@ladygin.pro
//          Sergey Osokin, email: hi@sergosokin.ru
// ============================================================================
// 安装:
// 1. 将脚本放至在:
//    Win (32 位): C:\Program Files (x86)\Adobe\Adobe Illustrator [版本号]\Presets\zh_CN\脚本\
//    Win (64 位): C:\Program Files\Adobe\Adobe Illustrator [版本号] (64 Bit)\Presets\zh_CN\脚本\
//    Mac OS: <hard drive>/Applications/Adobe Illustrator [版本号]/Presets.localized/zh_CN/脚本
// 2. 重启Ai。
// 3. 选择 文件 > 脚本 > 将对象随画板旋转 。
// ============================================================================
// 版本:
// 0.1 最初的版本。不能旋转锁定、隐藏项目。
// 1.0 增加图形用户界面: 选择当前画板或全部选择. 新脚本可以旋转锁定、隐藏项目。
// 1.1 增加旋转角度：90 CW或90 CCW。
// 1.2 问题修正。
// ============================================================================
// 如果你认为本脚本很实用, 可以给原作者通过PayPal或Yandex Money买杯咖啡。 ☕️ 
//    http://www.paypal.me/osokin/usd
//    https://money.yandex.ru/to/410011149615582
// ============================================================================
// 注意：
// 使用Ai CC 2017/2018 (Mac), CS6 (Win)进行测试。
// 此脚本按照现状提供，没有任何口头/书面保证。
// 授予个人非商业使用许可。
// ============================================================================
// 在MIT许可的情况下进行授权。
// http://opensource.org/licenses/mit-license.php
// ============================================================================
// 查看作者的其他脚本: https://github.com/creold

//@target illustrator
app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS;

var SCRIPT_NAME = '将对象随画板旋转',
    SCRIPT_VERSION = 'v.1.2';

try {
    if (documents.length > 0) {
        var doc = app.activeDocument,
            currArt = doc.artboards[doc.artboards.getActiveArtboardIndex()],
            currArtNum = doc.artboards.getActiveArtboardIndex() + 1,
            lockedItems = new Array(),
            hiddenItems = new Array();

        // Create Main Window
        var dlg = new Window('dialog', SCRIPT_NAME + ' ver.' + SCRIPT_VERSION, undefined);
        dlg.orientation = 'column';
        dlg.alignChildren = ['fill', 'fill'];

        // Target radiobutton
        var slctTarget = dlg.add('panel', undefined, '需要旋转？');
        slctTarget.orientation = 'column';
        slctTarget.alignChildren = 'left';
        slctTarget.margins = [10,20,10,10];
        var currArtRadio = slctTarget.add('radiobutton', undefined, '选择画板#' + currArtNum),
            allArtRadio = slctTarget.add('radiobutton', undefined, '全部选择 ' + doc.artboards.length + ' 个画板');
        currArtRadio.value = true;

        // Angle radiobutton
        var slctAngle = dlg.add('panel', undefined, '旋转角度');
        slctAngle.orientation = 'row';
        slctAngle.alignChildren = ['fill', 'fill'];
        slctAngle.margins = [10,20,10,10];
        var cwAngle = slctAngle.add('radiobutton', undefined, '顺时针90度'),
            ccwAngle = slctAngle.add('radiobutton', undefined, '逆时针90度');
        cwAngle.value = true;

        // Buttons
        var btns = dlg.add('group');
        btns.alignChildren = ['fill', 'fill'];
        btns.margins = [0, 10, 0, 0];
        var cancel = btns.add('button', undefined, '取消', {name: 'cancel'});
        cancel.helpTip = '轻按esc键以取消';
        var ok = btns.add('button', undefined, '确定', {name: 'ok'});
        ok.helpTip = '轻按回车以继续';
        ok.active = true;
        cancel.onClick = function () { dlg.close(); }
        ok.onClick = okClick;

        // Copyright block
        var copyright = dlg.add('statictext', undefined, '\u00A9 Alex Ladygin, Sergey Osokin');
        copyright.justify = 'center';
        copyright.enabled = false;

	    deselect();
        app.redraw();

        dlg.center();
        dlg.show();

        //Start
        function okClick() {
            // Saving information about locked & hidden pageItems
            saveItemsState();
            // Rotate active artboard or all artboards in document
            if (currArtRadio.value == true) {
                rotateArt(currArt);
            } else {
                for (var i = 0; i < doc.artboards.length; i++) {
                    doc.artboards.setActiveArtboardIndex(i);
                    rotateArt(doc.artboards[i]);
                }
            }
            // Restoring locked & hidden pageItems
            restoreItemsState();
            dlg.close();
        }
    } else {
        throw new Error(scriptName + '\n请在运行此脚本前打开一个文件。');
    }
} catch (e) {
    showError(e);
}

// Save information about locked & hidden pageItems
function saveItemsState() {
    for (var i = 0; i < doc.pageItems.length; i++) {
        var currItem = doc.pageItems[i];
        if (currItem.locked == true) {
            lockedItems.push(i);
            currItem.locked = false;
        }
        if (currItem.hidden == true) {
            hiddenItems.push(i);
            currItem.hidden = false;
        }
    }
}

// Restoring locked & hidden pageItems
function restoreItemsState() {
    for (var i = 0; i < lockedItems.length; i++) {
        var index = lockedItems[i];
        doc.pageItems[index].locked = true;
    }
    for (var j = 0; j < hiddenItems.length; j++) {
        var index = hiddenItems[j];
        doc.pageItems[index].hidden = true;
    }
}

// Main function for rotate artboard
function rotateArt(board) {
    app.coordinateSystem = CoordinateSystem.ARTBOARDCOORDINATESYSTEM;

    var artRect = [].concat(board.artboardRect),
        artWidth = artRect[2] - artRect[0],
        artHeight = -(artRect[3] - artRect[1]);
    deselect();
    doc.selectObjectsOnActiveArtboard();

    // Rotate artboard
    var newArtRect = [
        artRect[0] + artWidth / 2 - (artHeight / 2),
        artRect[1] - artHeight / 2 + (artWidth / 2),
        artRect[2] - artWidth / 2 + (artHeight / 2),
        artRect[3] + artHeight / 2 - (artWidth / 2)
    ];

    // Rotate objects
    for (var k = 0; k < selection.length; k++) {
        var bnds = selection[k].position,
            __width = selection[k].width,
            __height = selection[k].height,
            top = bnds[1] - artRect[1],
            left = bnds[0] - artRect[0];

        if (cwAngle.value == true) {
            // rotate 90 CW
            selection[k].rotate(-90, true, true, true, true, Transformation.CENTER);
            selection[k].position = [newArtRect[2] - __height + top, newArtRect[1] - left];
        } else {
            // rotate 90 CCW
            selection[k].rotate(90, true, true, true, true, Transformation.CENTER);
            selection[k].position = [newArtRect[0] - top, newArtRect[3] + left + __width];
        }
    }
    deselect();
    board.artboardRect = newArtRect;
}

function deselect() {
    activeDocument.selection = null;
}

function showError(err) {
    if (confirm(scriptName + ': 发生了一个未知的错误。\n' +
        '您想看更多信息吗？', true, '未知错误')) {
        alert(err + ': 位于' + err.line, '脚本错误', true);
    }
}
