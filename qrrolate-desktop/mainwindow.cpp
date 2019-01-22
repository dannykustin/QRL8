#include "mainwindow.h"
#include "ui_mainwindow.h"

std::string detect_code(zbar::ImageScanner &scanner, cv::Mat &frame) {
    using namespace std;

    cv::Mat grey;
    cv::cvtColor(frame, grey, CV_BGR2GRAY);

    zbar::Image image(grey.cols,              // width
                      grey.rows,              // height
                      "Y800",                 // format
                      (uchar *)grey.data,     // data
                      grey.cols * grey.rows); // length

    scanner.scan(image);

    for (auto code = image.symbol_begin(); code != image.symbol_end(); ++code) {
        return code->get_data();
    }
    return "";
}

const std::vector<std::string> explode(const std::string& s, const char& c)
{
    std::string buff{""};
    std::vector<std::string> v;

    for(auto n:s)
    {
        if(n != c) buff+=n; else
            if(n == c && buff != "") { v.push_back(buff); buff = ""; }
    }
    if(buff != "") v.push_back(buff);

    return v;
}

MainWindow::MainWindow(QWidget *parent) :
    QMainWindow(parent),
    ui(new Ui::MainWindow)
{
    ui->setupUi(this);
    setFixedSize(330, 396);
    ui->sourceFolderValidLbl->hide();
    ui->dataFileValidLbl->hide();
    ui->destinationFolderValidLbl->hide();
    ui->successLbl->hide();
}

MainWindow::~MainWindow()
{
    delete ui;
}

void MainWindow::on_sourceFolderBtn_clicked()
{
    sourceFolder = QFileDialog::getExistingDirectory(this, tr("Choose Source Folder"),
                                                     QStandardPaths::writableLocation(QStandardPaths::DesktopLocation),
                                                     QFileDialog::ShowDirsOnly
                                                     | QFileDialog::DontResolveSymlinks);
    validate_fields();
}

void MainWindow::on_dataFileBtn_clicked()
{
    dataFile = QFileDialog::getOpenFileName(this, "Select Data File",
                                            QStandardPaths::writableLocation(QStandardPaths::DesktopLocation),
                                            tr("CSV Files (*.csv)"));
    validate_fields();
}

void MainWindow::on_destinationFolderBtn_clicked()
{
    destinationFolder = QFileDialog::getExistingDirectory(this, tr("Choose Source Folder"),
                                                          QStandardPaths::writableLocation(QStandardPaths::DesktopLocation),
                                                          QFileDialog::ShowDirsOnly
                                                          | QFileDialog::DontResolveSymlinks);
    validate_fields();
}

void MainWindow::on_goBtn_clicked()
{
    // Load data from the CSV file
    std::stringstream dataBuffer;
    std::ifstream file( dataFile.toStdString() );
    dataBuffer << file.rdbuf();
    file.close();

    pw = new ProcessingPopup(); // Be sure to destroy your window somewhere
    pw->show();

    ui->centralWidget->setEnabled(false);

    cv::Mat processingFrame;
    cv::Mat previewFrame;

    zbar::ImageScanner scanner;
    scanner.set_config(zbar::ZBAR_NONE, zbar::ZBAR_CFG_ENABLE, 0);  // disable all symbologies
    scanner.set_config(zbar::ZBAR_QRCODE, zbar::ZBAR_CFG_ENABLE, 1);  // enable QR Code only

    QPixmap pixmap;

    QDirIterator it(sourceFolder, QStringList() << "*.mp4", QDir::Files, QDirIterator::Subdirectories);

    int previewWidth = 160;
    int previewHeight = 90;
    float pixelRatio = 1.0;

    if (devicePixelRatio() >= 1.5) {
        previewWidth = 320;
        previewHeight = 180;
        pixelRatio = 2.0;
    }

    // Loop through each directory
    while (it.hasNext()) {

        std::string path = it.next().toStdString();
        std::cout << "Processing file: " << path << std::endl;

        cv::VideoCapture capture(path);
        QFileInfo fi(QString::fromStdString(path));
        pw->setFileName(fi.fileName());
        pw->setWriteMode(false);

        int totalFrames = capture.get(cv::CAP_PROP_FRAME_COUNT);
        int currentFrame = 0;
        std::string detectedCode;

        std::string clipDate;
        std::string clipScene = "Scene_";
        std::string clipShot = "Shot_";
        std::string clipTake = "Take_";
        std::string fileName;
        std::string fileDir;
        std::string filePath;

        // Loop through each frame
        for(;;) {
            if (processingFrame.data)
                processingFrame.~Mat();
            if (previewFrame.data)
                previewFrame.~Mat();
            capture >> processingFrame;

            if (processingFrame.data) {

                currentFrame++;
                pw->setProgress(0, totalFrames, currentFrame);

                // Resize for faster processing
                cv::resize(processingFrame, processingFrame, cv::Size(1280, 720), 0, 0, cv::INTER_CUBIC);

                // Display a preview of the current frame
                cv::resize(processingFrame, previewFrame, cv::Size(previewWidth, previewHeight), 0, 0, cv::INTER_CUBIC);
                cv::cvtColor(previewFrame, previewFrame, cv::COLOR_BGR2RGB);
                QImage qImage((uchar*)previewFrame.data, previewFrame.cols, previewFrame.rows, previewFrame.step, QImage::Format_RGB888);
                pixmap = QPixmap::fromImage(qImage);
                pixmap.setDevicePixelRatio(pixelRatio);
                pw->setPreviewFrame(pixmap);
                QCoreApplication::processEvents();

                // Process located data
                detectedCode = detect_code(scanner, processingFrame);
                if (detectedCode != "") {
                    pw->setProgress(1);
                    pw->setWriteMode(true);

                    std::cout << "Detected code: " << detectedCode << std::endl;

                    // Find the entry from the CSV
                    dataBuffer.clear();
                    dataBuffer.seekg(0, std::ios::beg);
                    std::string data;
                    while (dataBuffer.good()) {
                        getline(dataBuffer, data, '\n');
                        std::vector<std::string> v{explode(data, ',')};

                        // Extract data from the correct row
                        if (v.size() > 0) {
                            if (v.at(0) == detectedCode) {
                                clipDate = v.at(10).substr(1, v.at(10).size() - 2);
                                clipScene += v.at(2);
                                clipShot += v.at(3).substr(1, v.at(3).size() - 2);
                                clipTake += v.at(4);
                                // we don't need to keep reading the file
                                break;
                            }
                        }
                    }

                    // build the file name and directory
                    fileName = clipScene + "-" + clipShot + "-" + clipTake + "." + fi.completeSuffix().toStdString();
                    pw->setFileName(QString::fromStdString(fileName));
                    fileDir = destinationFolder.toStdString() + "/" + clipDate + "/" + clipScene + "/" + clipShot;
                    filePath = fileDir + "/" + fileName;
                    std::cout << "New file: " << filePath << std::endl;

                    // Write the new file, creating the directory if it doesn't already exist
                    boost::filesystem::create_directories(fileDir);
                    QFile* sourceFile = new QFile(QString::fromStdString(path));
                    sourceFile->open(QIODevice::ReadOnly);
                    QFile* targetFile = new QFile(QString::fromStdString(filePath));
                    targetFile->open(QIODevice::WriteOnly);
                    pw->setProgress(0, sourceFile->size(), 0);
                    QByteArray buffer;
                    for (int count = 0; !(buffer = sourceFile->read(1000000)).isEmpty(); count+=1000000)
                    {
                        targetFile->write(buffer);
                        pw->setProgress(count);
                    }

                    // stop analyzing this file for codes
                    break;
                }

                if(cv::waitKey(1) >= 0) break;
            } else {
                break;
            }

        }
    }

    // We're done!
    pw->~ProcessingPopup();
    sourceFolder = "";
    dataFile = "";
    destinationFolder = "";
    QSound::play(":/tada.wav");
    validate_fields();
    ui->successLbl->show();

    ui->centralWidget->setEnabled(true);
}

void MainWindow::validate_fields() {
    sourceFolder != "" ? ui->sourceFolderValidLbl->show() : ui->sourceFolderValidLbl->hide();
    dataFile != "" ? ui->dataFileValidLbl->show() : ui->dataFileValidLbl->hide();
    destinationFolder != "" ? ui->destinationFolderValidLbl->show() : ui->destinationFolderValidLbl->hide();
    ui->goBtn->setEnabled(sourceFolder != "" && dataFile != "" && destinationFolder != "");
    ui->successLbl->hide();
}
