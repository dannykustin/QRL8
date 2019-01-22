#include "processingpopup.h"
#include "ui_processingpopup.h"

ProcessingPopup::ProcessingPopup(QWidget *parent) :
    QDialog(parent),
    ui(new Ui::processingpopup)
{
    ui->setupUi(this);
    setWindowFlags(Qt::Window | Qt::FramelessWindowHint);
}

void ProcessingPopup::setPreviewFrame(QPixmap pixmap) {
    ui->videoPreview->setPixmap(pixmap);
}

void ProcessingPopup::setFileName(QString fileName) {
    ui->fileName->setText(fileName);
}

void ProcessingPopup::setWriteMode(bool writeMode) {
    if (writeMode) {
        ui->statusLbl->setText("Writing file...");
        ui->thumbnailCheckLbl->show();
    } else {
        ui->statusLbl->setText("Searching for code...");
        ui->thumbnailCheckLbl->hide();
    }
    QCoreApplication::processEvents();
}

void ProcessingPopup::setProgress(int value) {
    ui->progressBar->setValue(value);
}

void ProcessingPopup::setProgress(int minimum, int maximum, int value) {
    ui->progressBar->setMinimum(minimum);
    ui->progressBar->setMaximum(maximum);
    ui->progressBar->setValue(value);
}

ProcessingPopup::~ProcessingPopup()
{
    delete ui;
}
