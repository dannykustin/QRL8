#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <QMainWindow>
#include <opencv2/highgui/highgui.hpp>
#include <opencv2/imgproc/imgproc.hpp>
#include <opencv2/videoio.hpp>
#include <zbar.h>
#include <iostream>
#include <chrono>
#include <QFileDialog>
#include <QStandardPaths>
#include <QDirIterator>
#include <QDebug>
#include "processingpopup.h"
#include <fstream>
#include <boost/filesystem.hpp>
#include <QFile>
#include <QSound>

namespace Ui {
class MainWindow;
}

class MainWindow : public QMainWindow
{
    Q_OBJECT

public:
    explicit MainWindow(QWidget *parent = 0);
    ~MainWindow();

public:
    QString sourceFolder;
    QString dataFile;
    QString destinationFolder;

private:
    void validate_fields();

private:
   ProcessingPopup *pw;

private slots:

    void on_sourceFolderBtn_clicked();

    void on_dataFileBtn_clicked();

    void on_destinationFolderBtn_clicked();

    void on_goBtn_clicked();

private:
    Ui::MainWindow *ui;
};

#endif // MAINWINDOW_H
