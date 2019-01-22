#ifndef PROCESSINGPOPUP_H
#define PROCESSINGPOPUP_H

#include <QDialog>

namespace Ui {
class processingpopup;
}

class ProcessingPopup : public QDialog
{
    Q_OBJECT

public:
    explicit ProcessingPopup(QWidget *parent = 0);
    ~ProcessingPopup();

public:
    void setPreviewFrame(QPixmap pixmap);
    void setFileName(QString fileName);
    void setWriteMode(bool writeMode);
    void setProgress(int value);
    void setProgress(int minimum, int maximum, int value);

private:
    Ui::processingpopup *ui;
};

#endif // PROCESSINGPOPUP_H
