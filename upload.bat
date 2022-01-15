title GIT upload
color 16


echo start uploading
echo current directory：%cd%

git add -A .


set /p declation=:
git commit -m "%declation%"
echo 

git push origin main
echo 

echo;
echo All Done
echo;

pause
