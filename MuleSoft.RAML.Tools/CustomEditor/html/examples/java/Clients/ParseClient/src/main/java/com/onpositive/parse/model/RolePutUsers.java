package com.onpositive.parse.model;

import java.util.List;
import javax.xml.bind.annotation.XmlElement;

public class RolePutUsers {

    @XmlElement(name="__op")
    public String __op;


    @XmlElement(name="objects")
    public List<RolePutUsersObjects> objects;

}