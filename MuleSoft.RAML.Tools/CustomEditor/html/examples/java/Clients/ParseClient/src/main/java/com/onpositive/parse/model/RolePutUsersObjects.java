package com.onpositive.parse.model;

import javax.xml.bind.annotation.XmlElement;

public class RolePutUsersObjects {

    @XmlElement(name="__type")
    public String __type;


    @XmlElement(name="className")
    public String className;


    @XmlElement(name="objectId")
    public String objectId;

}